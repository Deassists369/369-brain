const mongoConnector = require('./mongodb-connector');

/**
 * 369 MISSION VAULT — RAG Engine
 * 
 * Indexes: Obsidian vault + 369-brain markdown files
 * Serves:  /api/rag/search  — returns relevant chunks for a query
 *          /api/rag/status  — shows index state
 *          /api/rag/index   — forces re-index
 *
 * HOW IT WORKS (Level 4 — no vector database needed):
 *   1. On startup: reads every .md file in brain + Obsidian vault
 *   2. Splits each into paragraphs, stores title + path + content
 *   3. On query: scores every chunk with simple keyword matching
 *   4. Returns top 8 chunks as context
 *   5. Server calls Claude API: "Here is the context. Answer: [question]"
 *   6. Answer arrives with exact source citations
 *
 * This is REAL RAG — Claude answers from YOUR documents, not from training.
 */

const fs   = require('fs');
const path = require('path');
const os   = require('os');

const BRAIN = path.join(os.homedir(), 'deassists-workspace', '369-brain');

// ── CONFIG — set your Obsidian vault path here ─────────────────────────────
const VAULT_PATHS = [
  // 369 RAG vault — confirmed location on Mac Mini
  path.join(os.homedir(), 'Documents', '369 RAG', '369 RAG'),
  // iCloud Obsidian (for future MacBook)
  path.join(os.homedir(), 'Library', 'Mobile Documents', 'iCloud~md~obsidian', 'Documents'),
  // Other fallbacks
  path.join(os.homedir(), 'Documents', 'Obsidian'),
  path.join(os.homedir(), 'Documents', 'ObsidianVault'),
];

// ── INDEX STORE ─────────────────────────────────────────────────────────────
const INDEX = {
  chunks: [],       // { id, source, file, title, content, path, indexed_at }
  sources: {},      // { source_name: { files, chunks, path, status } }
  built_at: null,
  building: false,
};

// ── FILE WALKER ─────────────────────────────────────────────────────────────
function walkDir(dir, ext = '.md', files = []) {
  if (!fs.existsSync(dir)) return files;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      if (e.name.startsWith('.') || e.name === 'node_modules') continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walkDir(full, ext, files);
      else if (e.name.endsWith(ext)) files.push(full);
    }
  } catch {}
  return files;
}

// ── PARSE MARKDOWN INTO CHUNKS ───────────────────────────────────────────────
function parseFile(filePath, source) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const name = path.basename(filePath, '.md');

    // Extract title from first H1 or filename
    const h1 = raw.match(/^#\s+(.+)/m);
    const title = h1 ? h1[1].trim() : name.replace(/-|_/g, ' ');

    // Split into paragraphs (min 40 chars, max 1200 chars)
    const paragraphs = raw
      .split(/\n{2,}/)
      .map(p => p.trim())
      .filter(p => p.length >= 40 && !p.startsWith('```'))
      .map(p => p.slice(0, 1200));

    return paragraphs.map((content, i) => ({
      id:         `${source}::${name}::${i}`,
      source,
      file:       name,
      title,
      path:       filePath,
      content,
      indexed_at: new Date().toISOString(),
    }));
  } catch { return []; }
}

// ── BUILD INDEX ──────────────────────────────────────────────────────────────
async function buildIndex() {
  if (INDEX.building) return;
  INDEX.building = true;
  INDEX.chunks = [];
  INDEX.sources = {};
  const now = new Date().toISOString();

  // 1. Index 369-brain
  const brainFiles = walkDir(BRAIN);
  const brainChunks = brainFiles.flatMap(f => parseFile(f, 'brain'));
  INDEX.chunks.push(...brainChunks);
  INDEX.sources['brain'] = {
    path: BRAIN,
    status: 'indexed',
    files: brainFiles.length,
    chunks: brainChunks.length,
    indexed_at: now,
  };

  // 2. Index Obsidian vault (first path that exists)
  let obsidianIndexed = false;
  for (const vaultPath of VAULT_PATHS) {
    if (fs.existsSync(vaultPath)) {
      const obsFiles = walkDir(vaultPath);
      const obsChunks = obsFiles.flatMap(f => parseFile(f, 'notes'));
      INDEX.chunks.push(...obsChunks);
      INDEX.sources['notes'] = {
        path: vaultPath,
        status: 'indexed',
        files: obsFiles.length,
        chunks: obsChunks.length,
        indexed_at: now,
      };
      obsidianIndexed = true;
      console.log(`[RAG] Notes vault indexed: ${vaultPath} (${obsFiles.length} files)`);
      break;
    }
  }
  if (!obsidianIndexed) {
    INDEX.sources['notes'] = {
      path: null,
      status: 'not_found',
      files: 0,
      chunks: 0,
      message: 'No Obsidian vault found. Check VAULT_PATHS in rag-engine.js',
      searched: VAULT_PATHS,
    };
  }

  // 3. Index MongoDB
  try {
    const mongoChunks = await mongoConnector.getChunks();
    INDEX.chunks.push(...mongoChunks);
    const mongoStatus = mongoConnector.getStatus();
    INDEX.sources['mongodb'] = {
      status: mongoChunks.length ? 'indexed' : 'empty',
      chunks: mongoChunks.length,
      documents: mongoStatus.totalDocuments || 0,
      collections: mongoStatus.collections || {},
      last_sync: mongoStatus.lastSync,
    };
    console.log(`[RAG] MongoDB: ${mongoChunks.length} chunks`);
  } catch(e) {
    INDEX.sources['mongodb'] = { status: 'error', error: e.message, chunks: 0 };
    console.log('[RAG] MongoDB error:', e.message);
  }

  // 4. Index portal codebase (controllers, entities, modules)
  try {
    const PORTAL = path.join(os.homedir(), 'deassists', 'apps');
    const PORTAL_EXTS = ['.entity.ts', '.controller.ts',
      '.module.ts', '.service.ts', '.dto.ts'];
    const SKIP_DIRS = ['node_modules', 'dist', '.next',
      'generated', '__tests__', '.git'];

    const portalFiles = [];
    function walkPortal(dir) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const e of entries) {
          if (SKIP_DIRS.includes(e.name)) continue;
          const full = path.join(dir, e.name);
          if (e.isDirectory()) walkPortal(full);
          else if (PORTAL_EXTS.some(x => e.name.endsWith(x)))
            portalFiles.push(full);
        }
      } catch {}
    }

    if (fs.existsSync(PORTAL)) {
      walkPortal(PORTAL);
      const portalChunks = portalFiles.flatMap(f =>
        parseFile(f, 'portal'));
      INDEX.chunks.push(...portalChunks);
      INDEX.sources['portal'] = {
        status: 'indexed',
        files: portalFiles.length,
        chunks: portalChunks.length,
        indexed_at: now,
      };
      console.log(`[RAG] Portal: ${portalFiles.length} files → ${portalChunks.length} chunks`);
    } else {
      INDEX.sources['portal'] = { status: 'not_found', chunks: 0 };
    }
  } catch(e) {
    INDEX.sources['portal'] = { status: 'error', error: e.message, chunks: 0 };
    console.log('[RAG] Portal error:', e.message);
  }

  // 5. Index PDF uploads
  try {
    const pdfUploadDir = path.join(os.homedir(), 'deassists-workspace', '369-brain', 'intelligence', 'uploads', 'pdf');
    if (fs.existsSync(pdfUploadDir)) {
      const pdfMdFiles = fs.readdirSync(pdfUploadDir)
        .filter(f => f.endsWith('.md'))
        .map(f => path.join(pdfUploadDir, f));
      const pdfChunks = pdfMdFiles.flatMap(f => parseFile(f, 'pdf'));
      INDEX.chunks.push(...pdfChunks);
      INDEX.sources['pdf'] = {
        status: pdfChunks.length ? 'indexed' : 'empty',
        files: pdfMdFiles.length,
        chunks: pdfChunks.length,
        indexed_at: now,
      };
      console.log(`[RAG] PDF uploads: ${pdfMdFiles.length} files → ${pdfChunks.length} chunks`);
    } else {
      INDEX.sources['pdf'] = { status: 'empty', files: 0, chunks: 0 };
    }
  } catch(e) {
    INDEX.sources['pdf'] = { status: 'error', error: e.message, chunks: 0 };
  }

  INDEX.built_at = now;
  INDEX.building = false;
  console.log(`[RAG] Index built: ${INDEX.chunks.length} chunks from ${Object.keys(INDEX.sources).length} sources`);
}

// ── KEYWORD SEARCH ───────────────────────────────────────────────────────────
function search(query, sources = ['brain', 'notes'], topK = 8) {
  if (!INDEX.built_at) buildIndex();

  const terms = query.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (!terms.length) return [];

  // Score each chunk
  const scored = INDEX.chunks
    .filter(c => sources.includes(c.source))
    .map(c => {
      const text = (c.title + ' ' + c.content).toLowerCase();
      let score = 0;
      for (const term of terms) {
        const count = (text.match(new RegExp(term, 'g')) || []).length;
        score += count * (c.title.toLowerCase().includes(term) ? 3 : 1);
      }
      return { ...c, score };
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored;
}

// ── FORMAT CONTEXT FOR CLAUDE ─────────────────────────────────────────────────
function buildContext(chunks) {
  if (!chunks.length) return 'No relevant documents found in the vault.';
  return chunks.map((c, i) =>
    `[Document ${i + 1}: ${c.title} — from ${c.source} (${path.basename(c.path)})]\n${c.content}`
  ).join('\n\n---\n\n');
}

// ── RAG QUERY — called by server ──────────────────────────────────────────────
async function ragQuery(question, sources, apiKey) {
  if (!INDEX.built_at) buildIndex();

  const chunks = search(question, sources);
  const context = buildContext(chunks);

  if (!apiKey) {
    return {
      answer: 'Claude API key not configured. Add ANTHROPIC_API_KEY to ecosystem.config.cjs and restart.',
      chunks: [],
      citations: [],
    };
  }

  const prompt = `You are VEERABHADRA, the AI brain of DeAssists. Answer the CEO's question using ONLY the document context provided below.

CONTEXT FROM VAULT:
${context}

CEO QUESTION: "${question}"

Rules:
- Answer in plain English, 2-5 sentences
- Cite the exact document name for each key fact: (source: brain/filename.md) or (source: notes/filename.md)
- If the context does not contain the answer, say "I could not find this in the connected documents — try connecting more sources."
- Never guess or use knowledge outside the provided context`;

  const https = require('https');
  return new Promise(resolve => {
    const body = JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }]
    });
    const req = https.request({
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      }
    }, r => {
      let data = '';
      r.on('data', c => data += c);
      r.on('end', () => {
        try {
          const d = JSON.parse(data);
          const answer = d.content && d.content[0] ? d.content[0].text : 'No response from Claude.';
          resolve({
            answer,
            chunks_found: chunks.length,
            citations: chunks.map(c => ({ file: c.file, source: c.source, title: c.title, score: c.score })),
            context_used: chunks.length > 0,
          });
        } catch (e) {
          resolve({ answer: 'Error parsing Claude response: ' + e.message, chunks: [], citations: [] });
        }
      });
    });
    req.on('error', e => resolve({ answer: 'Claude API error: ' + e.message, chunks: [], citations: [] }));
    req.write(body);
    req.end();
  });
}

// ── BUILD ON LOAD ─────────────────────────────────────────────────────────────
buildIndex();

setInterval(() => {
  if (!INDEX.building) {
    buildIndex().catch(console.error);
    console.log('[RAG] Auto-reindex completed —', new Date().toLocaleTimeString());
  }
}, 10 * 60 * 1000);

// ── EXPORTS (used by server.js) ───────────────────────────────────────────────
module.exports = {
  buildIndex,
  search,
  ragQuery,
  getStatus: () => ({
    built_at: INDEX.built_at,
    building: INDEX.building,
    total_chunks: INDEX.chunks.length,
    sources: INDEX.sources,
  }),
};
