/**
 * 369 MISSION VAULT — Complete Server v3
 * 
 * Endpoints:
 *   GET  /               → dashboard HTML
 *   GET  /api/data       → live system data
 *   GET  /api/status     → server + API + RAG status
 *   GET  /preview/:f     → serves brain/previews/:f.html
 *   POST /api/claude     → Claude API proxy (uses ANTHROPIC_API_KEY)
 *   POST /api/approve    → approve/reject ticket from UI
 *   POST /api/rag/search → RAG query (searches files + Claude answers)
 *   GET  /api/rag/status → RAG index status
 *   POST /api/rag/index  → force re-index all sources
 */

const http  = require('http');
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const os    = require('os');

const BRAIN = path.join(os.homedir(), 'deassists-workspace', '369-brain');
const RUNS  = path.join(BRAIN, 'intelligence', 'harness-runs');
const PORT  = 3369;

// Load RAG engine
const rag = require('./rag-engine');

/* ── helpers ──────────────────────────────────────────────── */
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}
function json(res, code, obj) {
  cors(res); res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}
function readBody(req) {
  return new Promise(r => { let b=''; req.on('data',c=>b+=c); req.on('end',()=>r(b)); });
}
function readJSONL(file) {
  try {
    return fs.readFileSync(file,'utf8').trim().split('\n')
      .filter(Boolean).map(l=>{try{return JSON.parse(l);}catch{return null;}}).filter(Boolean);
  } catch { return []; }
}

/* ── /api/data ────────────────────────────────────────────── */
function getData() {
  const eagle       = readJSONL(path.join(RUNS,'eagle-harness.jsonl'));
  const test        = readJSONL(path.join(RUNS,'test-harness.jsonl'));
  const selfImprove = readJSONL(path.join(RUNS,'self-improvement.jsonl'));
  const tp = f => fs.existsSync(path.join(BRAIN,'tickets',f))
    ? fs.readdirSync(path.join(BRAIN,'tickets',f)).filter(x=>x.endsWith('.md')) : [];
  return { eagle, test, selfImprove,
    ticketsOpen:tp('open'), ticketsAwaiting:tp('awaiting-approval'),
    ticketsComplete:tp('complete'), timestamp:new Date().toISOString() };
}

/* ── /api/status ──────────────────────────────────────────── */
function getStatus() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const ragStatus = rag.getStatus();
  const previews = fs.existsSync(path.join(BRAIN,'previews'))
    ? fs.readdirSync(path.join(BRAIN,'previews')).filter(f=>f.endsWith('.html')) : [];
  return {
    server:     'running',
    port:       PORT,
    claude_api: apiKey ? 'READY' : 'MISSING — add ANTHROPIC_API_KEY to ecosystem.config.cjs',
    rag:        ragStatus,
    previews_found: previews.length,
    previews,
    brain_path: BRAIN,
    timestamp:  new Date().toISOString(),
  };
}

/* ── /api/sources ─────────────────────────────────────────── */
function getSources() {
  const knowledgeMap = [];
  const obsidianBase = path.join(os.homedir(),
    'Documents', '369 RAG', '369 RAG');
  const brainBase = path.join(os.homedir(),
    'deassists-workspace', '369-brain');

  // Read Obsidian folders dynamically
  if (fs.existsSync(obsidianBase)) {
    const folders = fs.readdirSync(obsidianBase,
      { withFileTypes: true })
      .filter(d => d.isDirectory() && !d.name.startsWith('.'));

    const folderIcons = {
      'BCBT': '🎓', 'Decisions': '🧭', 'Operations': '⚙️',
      'Finance': '💰', 'Staff': '👥', 'Partners': '🤝',
      'Personal-Notes': '💭', 'Build-Log': '🏗',
      'Legal': '⚖️', 'Germany': '🇩🇪'
    };

    for (const folder of folders) {
      const folderPath = path.join(obsidianBase, folder.name);
      const files = fs.readdirSync(folderPath)
        .filter(f => f.endsWith('.md'));
      if (files.length > 0) {
        knowledgeMap.push({
          id: folder.name.toLowerCase(),
          label: folder.name.replace(/-/g, ' '),
          icon: folderIcons[folder.name] || '📁',
          count: files.length,
          source: 'notes'
        });
      }
    }
  }

  // Add MongoDB collections to knowledge map
  try {
    const mongoConnector = require('./mongodb-connector');
    const mongoStatus = mongoConnector.getStatus();
    if (mongoStatus?.collections) {
      const icons = {
        users:'👤', course_applications:'📋',
        user_documents:'📄', payment_transactions:'💰',
        partners:'🤝', courses:'🎓',
        apartment_applications:'🏠',
        course_questionnaires:'📝',
        visa_support_questionnaires:'📋',
        insurance_questionnaires:'🛡',
        job_applications:'💼',
        legal_support_questionnaires:'⚖️',
        organizations:'🏢',
        ausbildung_applications:'🔧'
      };
      for (const [name, stats] of Object.entries(mongoStatus.collections)) {
        if (['refreshtokens','notifications',
          'automated_email_template_histories',
          'email_template_histories'].includes(name)) continue;
        if (!stats.documents || stats.documents === 0) continue;
        knowledgeMap.push({
          id: name, source: 'mongodb',
          icon: icons[name] || '📊',
          label: name.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
          count: stats.documents,
          detail: 'Live database'
        });
      }
    }
  } catch(e) {}

  knowledgeMap.sort((a,b) => b.count - a.count);

  return knowledgeMap;
}

/* ── /preview/:feature ────────────────────────────────────── */
function servePreview(feature, res) {
  const safe = path.basename(feature.replace(/\.html$/i,'')).replace(/[^a-z0-9_-]/gi,'');
  const file = path.join(BRAIN,'previews', safe+'.html');
  if (fs.existsSync(file)) {
    cors(res); res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
    res.end(fs.readFileSync(file,'utf8'));
  } else {
    const avail = fs.existsSync(path.join(BRAIN,'previews'))
      ? fs.readdirSync(path.join(BRAIN,'previews')).filter(f=>f.endsWith('.html')).join(', ') : 'none';
    cors(res); res.writeHead(404,{'Content-Type':'text/html'});
    res.end(`<!DOCTYPE html><html><body style="font-family:sans-serif;padding:40px;background:#f8faf6">
      <h2 style="color:#dc2626">Preview not found: ${safe}</h2>
      <p>Expected: <code>${file}</code></p>
      <p>Available: <code>${avail || 'none'}</code></p>
      <p>Run the EAGLE harness Mode 2 on a ticket to generate a preview.</p>
    </body></html>`);
  }
}

/* ── /api/claude (proxy) ──────────────────────────────────── */
async function proxyClaude(body, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return json(res, 500, {
    error: 'ANTHROPIC_API_KEY not set',
    fix: 'Add ANTHROPIC_API_KEY to ecosystem.config.cjs env block, then: pm2 restart mission-control-369 --update-env'
  });
  return new Promise(resolve => {
    const payload = Buffer.from(body);
    const req = https.request({
      hostname:'api.anthropic.com', path:'/v1/messages', method:'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey,
        'anthropic-version':'2023-06-01', 'Content-Length':payload.length }
    }, r => {
      let data=''; r.on('data',c=>data+=c);
      r.on('end',()=>{ cors(res); res.writeHead(r.statusCode,{'Content-Type':'application/json'}); res.end(data); resolve(); });
    });
    req.on('error',e=>{json(res,502,{error:e.message});resolve();});
    req.write(payload); req.end();
  });
}

/* ── /api/approve ─────────────────────────────────────────── */
function handleApprove(body, res) {
  try {
    const { feature, action } = JSON.parse(body);
    if (!feature || !['approve','reject'].includes(action))
      return json(res, 400, { ok:false, error:'Need {feature, action:"approve"|"reject"}' });
    const appDir = path.join(BRAIN,'approvals');
    if (!fs.existsSync(appDir)) fs.mkdirSync(appDir,{recursive:true});
    const signal = action==='approve' ? `approved ${feature}` : `not approved ${feature}`;
    fs.writeFileSync(path.join(appDir,`${feature}.signal`), signal+'\n');
    const awaitingFile = path.join(BRAIN,'tickets','awaiting-approval',feature+'.md');
    if(fs.existsSync(awaitingFile)){
      const destDir = path.join(BRAIN,'tickets', action==='approve'?'open':'rejected');
      if(!fs.existsSync(destDir)) fs.mkdirSync(destDir,{recursive:true});
      fs.renameSync(awaitingFile, path.join(destDir, feature+'.md'));
    }
    fs.appendFileSync(path.join(appDir,'approvals.log'),
      JSON.stringify({feature,action,signal,timestamp:new Date().toISOString(),via:'mission-vault-ui'})+'\n');
    // Update JSONL status
    const jPath = path.join(RUNS,'eagle-harness.jsonl');
    if (fs.existsSync(jPath)) {
      let updated=false;
      const lines = fs.readFileSync(jPath,'utf8').trim().split('\n').filter(Boolean);
      const newLines = lines.map(line=>{
        try { const r=JSON.parse(line);
          if(!updated&&r.feature===feature&&r.status==='awaiting-approval'){
            updated=true;
            return JSON.stringify({...r,status:action==='approve'?'approved':'rejected',
              decided_at:new Date().toISOString(),decided_via:'mission-vault-ui'});
          } return line;
        } catch{return line;}
      });
      if(updated) fs.writeFileSync(jPath,newLines.join('\n')+'\n');
    }
    json(res, 200, { ok:true, signal, feature, action });
  } catch(e) { json(res, 500, { ok:false, error:e.message }); }
}

/* ── /api/rag/search ──────────────────────────────────────── */
async function handleRAGSearch(body, res) {
  try {
    const { question, sources = ['brain','obsidian'] } = JSON.parse(body);
    if (!question) return json(res, 400, { error: 'Need {question}' });
    const apiKey = process.env.ANTHROPIC_API_KEY;
    const result = await rag.ragQuery(question, sources, apiKey);
    json(res, 200, { ok:true, ...result });
  } catch(e) { json(res, 500, { ok:false, error:e.message }); }
}

/* ── MAIN SERVER ──────────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  const url = req.url.split('?')[0];
  if (req.method==='OPTIONS') { cors(res); res.writeHead(204); res.end(); return; }
  if (req.method==='GET') {
    if (url==='/api/data')         return json(res, 200, getData());
    if (url==='/api/status')       return json(res, 200, getStatus());
    if (url==='/api/rag/status')   return json(res, 200, rag.getStatus());
    if (url==='/api/guardian/status') {
      try {
        const testRunsDir = path.join(BRAIN,'intelligence','test-runs');
        const latestFile = path.join(testRunsDir,'latest.json');
        if (!fs.existsSync(latestFile)) {
          return json(res,200,{
            connected:false,status:'never_run',last_run:null,
            run_count:0,summary:{total:0,passed:0,failed:0,skipped:0},
            trigger:{reason:null},features:[],accounts:{},history:[],
            message:'No test runs yet.'
          });
        }
        const latest = JSON.parse(fs.readFileSync(latestFile,'utf8'));
        const runFiles = fs.readdirSync(testRunsDir)
          .filter(f=>f.endsWith('.json')&&f!=='latest.json'&&f!=='latest-report.json')
          .sort().reverse().slice(0,5);
        const history = runFiles.map(f=>{
          try{return JSON.parse(fs.readFileSync(path.join(testRunsDir,f),'utf8'));}
          catch{return null;}
        }).filter(Boolean);
        return json(res,200,{
          connected:true,
          status:latest.status,
          last_run:latest.run_date,
          last_run_at:latest.run_time,
          run_count:runFiles.length||1,
          summary:latest.summary,
          trigger:latest.trigger||{reason:'unknown'},
          features:latest.features||[],
          accounts:latest.accounts||{},
          history:history.map(h=>({
            run_id:h.run_id,run_date:h.run_date,
            status:h.status,summary:h.summary,
            trigger:h.trigger
          }))
        });
      } catch(e){return json(res,500,{error:e.message});}
    }
    if (url==='/api/sources') {
      const ragStatus = rag.getStatus();
      const sources = [];
      if (ragStatus.sources?.brain?.chunks > 0)
        sources.push({ id:'brain', label:'🧠 Brain', connected:true,
          chunks:ragStatus.sources.brain.chunks,
          files:ragStatus.sources.brain.files,
          description:'All decisions rules build history' });
      if (ragStatus.sources?.notes?.chunks > 0)
        sources.push({ id:'notes', label:'📝 Notes', connected:true,
          chunks:ragStatus.sources.notes.chunks,
          files:ragStatus.sources.notes.files,
          description:'Obsidian business notes' });
      if (ragStatus.sources?.mongodb)
        sources.push({ id:'mongodb', label:'🗄 Students', connected:true,
          chunks:ragStatus.sources.mongodb.chunks,
          documents:ragStatus.sources.mongodb.documents||0,
          description:'Live student portal database' });
      if (ragStatus.sources?.portal?.chunks > 0)
        sources.push({
          id: 'portal',
          label: '💻 Portal Code',
          connected: true,
          chunks: ragStatus.sources.portal.chunks,
          files: ragStatus.sources.portal.files,
          description: 'Live portal — controllers entities modules'
        });
      const comingSoon = [
        {id:'dropbox',label:'📦 Dropbox',reason:'App scope blocked — fix in console'},
        {id:'gmail',label:'📧 Gmail',reason:'Not yet connected'},
        {id:'whatsapp',label:'📱 WhatsApp',reason:'Phase 3'},
        {id:'hermes',label:'🤖 Hermes',reason:'Phase 2 — install Ollama first'},
      ];
      return json(res, 200, {
        sources, knowledgeMap:getSources(),
        comingSoon, timestamp:new Date().toISOString()
      });
    }
    if (url.startsWith('/preview/')) return servePreview(url.replace('/preview/',''), res);
  }
  if (req.method==='POST') {
    const body = await readBody(req);
    if (url==='/api/claude')      return proxyClaude(body, res);
    if (url==='/api/approve')     return handleApprove(body, res);
    if (url==='/api/rag/search')  return handleRAGSearch(body, res);
    if (url==='/api/guardian/run' && req.method==='POST') {
      try {
        const testRunsDir = path.join(BRAIN,'intelligence','test-runs');
        const latestFile = path.join(testRunsDir,'latest.json');
        if (fs.existsSync(latestFile)) {
          const latest = JSON.parse(fs.readFileSync(latestFile,'utf8'));
          const age = Date.now() - new Date(latest.run_time||0).getTime();
          if (age < 60000) {
            return json(res,200,{ok:true,message:'Tests ran '+Math.round(age/1000)+'s ago. Results are fresh.',fresh:true});
          }
        }
        const {spawn}=require('child_process');
        const child=spawn('node',[
          path.join(BRAIN,'guardian-run-once.js')
        ],{detached:true,stdio:'ignore',env:{...process.env}});
        child.unref();
        return json(res,200,{ok:true,message:'Guardian test run started. Results in ~60 seconds.'});
      } catch(e){return json(res,500,{error:e.message});}
    }
    if (url==='/api/rag/index')   { rag.buildIndex(); return json(res,200,{ok:true,msg:'Re-indexing started'}); }
  }
  // Serve HTML
  try {
    const html = fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
    cors(res); res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'}); res.end(html);
  } catch(e) { res.writeHead(500); res.end('Dashboard not found'); }
});

server.listen(PORT, () => {
  const s = getStatus();
  console.log(`\n╔══════════════════════════════════════╗`);
  console.log(`║  369 MISSION VAULT → :${PORT}          ║`);
  console.log(`╠══════════════════════════════════════╣`);
  console.log(`║  Claude API : ${s.claude_api === 'READY' ? '✓ READY               ' : '✗ MISSING KEY         '}║`);
  console.log(`║  RAG chunks : ${String(s.rag.total_chunks).padEnd(22)}║`);
  console.log(`║  Previews   : ${String(s.previews_found).padEnd(22)}║`);
  console.log(`╚══════════════════════════════════════╝\n`);
});
