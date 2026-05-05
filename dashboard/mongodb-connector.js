const { MongoClient } = require('mongodb');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Read URI from portal .env — never hardcoded
function getMongoURI() {
  const envPath = path.join(os.homedir(), 'deassists', '.env');
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/(?:MONGODB_URI|DATABASE_HOST)\s*=\s*(.+)/);
    if (match) return match[1].trim();
  } catch(e) {}
  return process.env.MONGODB_URI || null;
}

const URI = getMongoURI();
let cachedChunks = [];
let lastSync = null;
let syncing = false;

function studentToChunks(student, collectionName) {
  const chunks = [];
  const id = student.studentId || student._id?.toString() || 'unknown';
  const name = [student.firstName, student.lastName].filter(Boolean).join(' ')
    || student.name || student.fullName || id;

  // Main record chunk
  const fields = Object.entries(student)
    .filter(([k]) => !['__v','password','token'].includes(k))
    .map(([k,v]) => `${k}: ${JSON.stringify(v)}`)
    .join('\n');

  chunks.push({
    id: `mongodb::${collectionName}::${id}`,
    source: 'mongodb',
    file: collectionName,
    title: `Student: ${name} (${id})`,
    path: `mongodb/${collectionName}/${id}`,
    content: `Student Record — ${name}\nID: ${id}\nCollection: ${collectionName}\n\n${fields}`,
    indexed_at: new Date().toISOString(),
  });

  return chunks;
}

async function syncMongoDB() {
  if (!URI) {
    console.log('[MongoDB] No URI found — skipping sync');
    return [];
  }
  if (syncing) return cachedChunks;
  syncing = true;

  let client;
  try {
    client = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });
    await client.connect();

    const dbName = URI.split('/').pop().split('?')[0] || 'dev';
    const db = client.db(dbName);
    const collections = await db.listCollections().toArray();

    console.log(`[MongoDB] Connected to: ${dbName}`);
    console.log(`[MongoDB] Collections: ${collections.map(c=>c.name).join(', ')}`);

    const chunks = [];
    const stats = {};

    for (const col of collections) {
      const name = col.name;
      if (name.startsWith('system.')) continue;
      try {
        const docs = await db.collection(name).find({}).limit(5000).toArray();
        const colChunks = docs.flatMap(d => studentToChunks(d, name));
        chunks.push(...colChunks);
        stats[name] = { documents: docs.length, chunks: colChunks.length };
        console.log(`[MongoDB] ${name}: ${docs.length} docs → ${colChunks.length} chunks`);
      } catch(e) {
        console.log(`[MongoDB] Skipped ${name}: ${e.message}`);
      }
    }

    cachedChunks = chunks;
    lastSync = new Date().toISOString();

    // Save status
    const statusPath = path.join(os.homedir(), 'deassists-workspace', '369-brain',
      'intelligence', 'mongodb-sync-status.json');
    fs.writeFileSync(statusPath, JSON.stringify({
      lastSync, collections: stats,
      totalChunks: chunks.length,
      totalDocuments: Object.values(stats).reduce((s,c)=>s+c.documents,0)
    }, null, 2));

    console.log(`[MongoDB] Sync complete: ${chunks.length} total chunks`);
    return chunks;

  } catch(e) {
    console.error('[MongoDB] Connection error:', e.message);
    return cachedChunks;
  } finally {
    if (client) await client.close().catch(()=>{});
    syncing = false;
  }
}

async function getChunks() {
  if (!cachedChunks.length) await syncMongoDB();
  return cachedChunks;
}

function getStatus() {
  const statusPath = path.join(os.homedir(), 'deassists-workspace', '369-brain',
    'intelligence', 'mongodb-sync-status.json');
  try {
    return JSON.parse(fs.readFileSync(statusPath, 'utf8'));
  } catch {
    return { lastSync: null, totalChunks: 0, totalDocuments: 0, connected: !!URI };
  }
}

// Auto-sync every 30 minutes
setInterval(syncMongoDB, 30 * 60 * 1000);

// Initial sync on load
syncMongoDB();

module.exports = { getChunks, syncMongoDB, getStatus };
