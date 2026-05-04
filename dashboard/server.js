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
    if (url==='/api/gmail/auth-start') {
      try {
        const credsPath = path.join(BRAIN,'integrations','gmail-credentials.json');
        const creds = JSON.parse(fs.readFileSync(credsPath,'utf8'));
        const c = creds.web || creds.installed;
        const client = new (require('google-auth-library').OAuth2Client)(
          c.client_id, c.client_secret,
          'http://localhost:3369/api/gmail/auth-callback'
        );
        const authUrl = client.generateAuthUrl({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/gmail.readonly'],
          prompt: 'consent'
        });
        return json(res, 200, { authUrl });
      } catch(e) { return json(res, 500, { error: e.message }); }
    }

    if (req.url.startsWith('/api/gmail/auth-callback')) {
      const qs = require('url').parse(req.url, true).query;
      const code = qs.code;
      if (!code) { res.writeHead(400); res.end('Missing code'); return; }
      try {
        const credsPath = path.join(BRAIN,'integrations','gmail-credentials.json');
        const creds = JSON.parse(fs.readFileSync(credsPath,'utf8'));
        const c = creds.web || creds.installed;
        const client = new (require('google-auth-library').OAuth2Client)(
          c.client_id, c.client_secret,
          'http://localhost:3369/api/gmail/auth-callback'
        );
        const { tokens } = await client.getToken(code);
        client.setCredentials(tokens);
        const gmail = require('googleapis').google.gmail({ version:'v1', auth:client });
        const profile = await gmail.users.getProfile({ userId:'me' });
        const email = profile.data.emailAddress;
        const tokenPath = path.join(BRAIN,'integrations',
          '.gmail-token-'+email.replace('@','_at_')+'.json');
        fs.writeFileSync(tokenPath, JSON.stringify(tokens,null,2));
        const gmailDir = path.join(BRAIN,'intelligence','gmail',
          email.replace('@','_at_'));
        if (!fs.existsSync(gmailDir)) fs.mkdirSync(gmailDir,{recursive:true});
        console.log('[Gmail] Connected:', email);
        res.writeHead(200,{'Content-Type':'text/html'});
        res.end(`<!DOCTYPE html><html><body style="font-family:-apple-system,sans-serif;padding:40px;text-align:center;background:#0d0d0d;color:#f5f5f5">
          <div style="font-size:48px;margin-bottom:16px">✅</div>
          <h2 style="color:#22c55e;margin-bottom:8px">Gmail Connected</h2>
          <p style="color:#a0a0a0">${email}</p>
          <p style="color:#606060;font-size:13px">Emails will be indexed into RAG shortly.<br>This window closes in 3 seconds.</p>
          <script>
            if(window.opener) window.opener.postMessage({type:'gmail-connected',email:'${email}'},'*');
            setTimeout(()=>window.close(),3000);
          </script>
        </body></html>`);
        // Start background sync
        setImmediate(async () => {
          try {
            const gmailSync = require('../integrations/gmail-sync');
            await gmailSync.syncAccount(email);
            console.log('[Gmail] Initial sync complete for', email);
          } catch(e) { console.error('[Gmail] Sync error:', e.message); }
        });
      } catch(e) {
        res.writeHead(500,{'Content-Type':'text/html'});
        res.end(`<html><body style="padding:40px;font-family:sans-serif;background:#0d0d0d;color:#f5f5f5">
          <h2 style="color:#ef4444">Connection failed</h2>
          <p style="color:#a0a0a0">${e.message}</p>
          <p><a href="javascript:window.close()" style="color:#22c55e">Close</a></p>
        </body></html>`);
      }
      return;
    }

    if (url==='/api/gmail/accounts') {
      try {
        const tokenFiles = fs.readdirSync(path.join(BRAIN,'integrations'))
          .filter(f=>f.startsWith('.gmail-token-')&&f.endsWith('.json'));
        const accounts = tokenFiles.map(f=>{
          const email = f.replace('.gmail-token-','').replace('.json','').replace('_at_','@');
          const gmailDir = path.join(BRAIN,'intelligence','gmail',f.replace('.gmail-token-','').replace('.json',''));
          const count = fs.existsSync(gmailDir) ? fs.readdirSync(gmailDir).filter(x=>x.endsWith('.md')).length : 0;
          return { email, indexed: count };
        });
        return json(res,200,{ connected: accounts.length>0, accounts });
      } catch(e){ return json(res,500,{error:e.message}); }
    }

    if (url==='/api/connections') {
      try {
        const registryPath = path.join(BRAIN,'intelligence','ai-registry.json');
        const registry = JSON.parse(fs.readFileSync(registryPath,'utf8'));
        const ragStatus = rag.getStatus();
        let ollamaList = '';
        try {
          ollamaList = require('child_process')
            .execSync('ollama list 2>/dev/null',{encoding:'utf8',timeout:2000})
            .toLowerCase();
        } catch {}
        const ollamaNames = {
          'ollama-nous-hermes':'nous-hermes',
          'mistral':'mistral','llama3':'llama3','deepseek':'deepseek'
        };
        const cloudEnvs = {
          'openai':'OPENAI_API_KEY','gemini':'GEMINI_API_KEY',
          'grok':'GROK_API_KEY','perplexity':'PERPLEXITY_API_KEY',
          'cohere':'COHERE_API_KEY'
        };
        const models = registry.models.map(m => {
          let live = false;
          if (m.id==='claude') live=!!(process.env.ANTHROPIC_API_KEY);
          else if (m.local) live=ollamaList.includes((ollamaNames[m.id]||m.id).toLowerCase());
          else live=!!(process.env[cloudEnvs[m.id]]);
          const {credential,...safe}=m;
          return {...safe,credential_status:live?'configured':'not_configured',
            live,status:live?'connected':m.status};
        });
        const srcMeta={
          brain:  {label:'369-brain',       icon:'🧠',desc:'Strategic memory decisions SOPs'},
          notes:  {label:'Obsidian Notes',  icon:'📝',desc:'Personal business knowledge'},
          mongodb:{label:'MongoDB Students',icon:'🗄',desc:'Live student database'},
          portal: {label:'Portal Code',     icon:'💻',desc:'Codebase controllers entities'},
          pdf:    {label:'PDF Uploads',     icon:'📄',desc:'Uploaded business documents'}
        };
        const sources=[];
        for(const [id,src] of Object.entries(ragStatus.sources||{})){
          const meta=srcMeta[id]||{label:id,icon:'📊',desc:''};
          const priv=(registry.data_privacy||{})[id]||{level:'unknown',allowed_models:[]};
          sources.push({id,...meta,
            status:src.chunks>0?'connected':'empty',
            chunks:src.chunks||0,
            files:src.files||src.documents||0,
            last_sync:src.indexed_at||null,
            privacy_level:priv.level,
            allowed_models:priv.allowed_models,
            requires_cloud_redaction:priv.requires_cloud_redaction||false});
        }
        const comingSoon=[
          {id:'dropbox',label:'Dropbox CORTEX-369',icon:'📦',status:'blocked',
           reason:'App disabled in Dropbox console',
           fix:'dropbox.com/developers → enable → tick files.metadata.read → new token'},
          {id:'gmail', label:'Gmail', icon:'📧',
            status: (() => {
              try {
                const hasToken = fs.readdirSync(path.join(BRAIN,'integrations'))
                  .some(f=>f.startsWith('.gmail-token-'));
                return hasToken ? 'connected' : 'coming_soon';
              } catch { return 'coming_soon'; }
            })(),
            reason: 'Connect via Mission Vault Connections tab'
          },
          {id:'whatsapp',label:'WhatsApp',        icon:'📱',status:'coming_soon',reason:'Phase 3'},
          {id:'telegram',label:'Telegram Control',icon:'📡',status:'coming_soon',reason:'Phase 3'},
          {id:'scraper', label:'Website Scraper', icon:'🌐',status:'coming_soon',reason:'Indexes any website into RAG'}
        ];
        const hMeta={
          'guardian':           {label:'Guardian',     icon:'🛡',purpose:'Tests portal after every EAGLE build',uses_ai:[]},
          'harness-worker':     {label:'EAGLE Builder',icon:'🏗',purpose:'Builds software from tickets',      uses_ai:['claude']},
          'dropbox-sync':       {label:'Dropbox Sync', icon:'📦',purpose:'Syncs documents from Dropbox',      uses_ai:[]},
          'mission-control-369':{label:'Mission Vault',icon:'🎛',purpose:'Serves this dashboard',             uses_ai:['claude']}
        };
        let harnesses=[];
        try{
          const pm2out=require('child_process')
            .execSync('pm2 jlist 2>/dev/null',{encoding:'utf8',timeout:3000});
          harnesses=JSON.parse(pm2out).filter(p=>hMeta[p.name]).map(p=>({
            id:p.name,...hMeta[p.name],
            status:p.pm2_env?.status||'unknown',pid:p.pid,
            restarts:p.pm2_env?.restart_time||0,
            memory_mb:Math.round((p.monit?.memory||0)/1024/1024)
          }));
        }catch{}
        return json(res,200,{
          router:registry.router,
          agent_frameworks:registry.agent_frameworks||[],
          models,sources,comingSoon,harnesses,
          routing_rules:registry.routing_rules,
          gate_levels:registry.gate_levels,
          hard_blocks:registry.hard_blocks||[],
          timestamp:new Date().toISOString()
        });
      }catch(e){return json(res,500,{error:e.message});}
    }

    if (url==='/api/self-improvement/status') {
      try {
        const fixesDir=path.join(BRAIN,'intelligence','proposed-fixes');
        if(!fs.existsSync(fixesDir)){
          return json(res,200,{connected:false,runs:0,patterns:0,
            fixes:{total:0,adopted:0,deferred:0,pending:0},
            next_run:null,latest_report:null,report_preview:'',
            message:'No self-improvement reports yet.'});
        }
        const files=fs.readdirSync(fixesDir).filter(f=>f.endsWith('.md')).sort();
        if(!files.length){
          return json(res,200,{connected:false,runs:0,patterns:0,
            fixes:{total:0,adopted:0,deferred:0,pending:0},
            next_run:null,latest_report:null,report_preview:''});
        }
        const lastFile=files[files.length-1];
        const content=fs.readFileSync(path.join(fixesDir,lastFile),'utf8');
        const patterns=(content.match(/Pattern\s+[A-Z]\s*[—–-]/g)||[]).length;
        const fixMatches=(content.match(/##\s*Fix\s*\d+/gi)||[]).length;
        const adopted=Math.min((content.match(/ADOPTED|✅\s*Fix/gi)||[]).length,fixMatches);
        const deferred=Math.min((content.match(/DEFERRED|⏸/gi)||[]).length,fixMatches);
        const dateStr=lastFile.split('-self-improvement')[0];
        let next_run=null;
        const ld=new Date(dateStr);
        if(!isNaN(ld.getTime())){
          const nd=new Date(ld);nd.setDate(nd.getDate()+7);
          next_run=nd.toISOString().split('T')[0];
        }
        const patternLines=[];
        const pReg=/[-*]\s+(Pattern\s+[A-Z][—–-][^\n]+)/g;
        let pm;while((pm=pReg.exec(content))!==null)patternLines.push(pm[1].trim());
        return json(res,200,{
          connected:true,runs:files.length,last_run:dateStr,next_run,patterns,
          pattern_summaries:patternLines.slice(0,5),
          fixes:{total:fixMatches,adopted,deferred,
            pending:Math.max(0,fixMatches-adopted-deferred)},
          latest_report:lastFile,
          report_preview:content.slice(0,600).replace(/##/g,'').trim(),
          all_reports:files
        });
      }catch(e){return json(res,500,{error:e.message});}
    }
    if (url==='/api/mission/overview') {
      try {
        const ragStatus = rag.getStatus();
        const testRunsDir = path.join(BRAIN,'intelligence','test-runs');
        const latestGuardian = path.join(testRunsDir,'latest.json');
        const fixesDir = path.join(BRAIN,'intelligence','proposed-fixes');
        const ticketsDir = path.join(BRAIN,'tickets');

        // Builder stats from tickets
        let builderTotal=0, builderDone=0, builderReview=0;
        try {
          const open = fs.readdirSync(path.join(ticketsDir,'open')).filter(f=>f.endsWith('.md')).length;
          const done = fs.readdirSync(path.join(ticketsDir,'complete')).filter(f=>f.endsWith('.md')).length;
          builderTotal = open + done;
          builderDone = done;
          builderReview = 0;
        } catch {}

        // Guardian stats
        let guardianRuns=0, guardianPassed=0, guardianFailed=0;
        try {
          if (fs.existsSync(latestGuardian)) {
            const lg = JSON.parse(fs.readFileSync(latestGuardian,'utf8'));
            guardianPassed = lg.summary.passed;
            guardianFailed = lg.summary.failed;
            guardianRuns = fs.readdirSync(testRunsDir)
              .filter(f=>f.endsWith('.json')&&f!=='latest.json'&&f!=='latest-report.json').length || 1;
          }
        } catch {}

        // Learner stats from proposed-fixes files
        let learnerRuns=0, learnerPatterns=0, learnerFixes=0;
        try {
          const fixes = fs.readdirSync(fixesDir).filter(f=>f.endsWith('.md'));
          learnerRuns = fixes.length;
          // Count patterns by reading last file
          if (fixes.length > 0) {
            const last = fs.readFileSync(path.join(fixesDir,fixes[fixes.length-1]),'utf8');
            const fixMatches = last.match(/##\s*Fix\s*\d+/gi) || [];
            learnerFixes = fixMatches.length;
            const patternMatches = last.match(/Pattern\s+[A-Z]\s*[—–-]/g) || [];
            learnerPatterns = patternMatches.length || null;
          }
        } catch {}

        // RAG stats
        const ragSources = Object.keys(ragStatus.sources||{}).filter(k=>ragStatus.sources[k].chunks>0).length;

        return json(res,200,{
          learner: { runs:learnerRuns, patterns:learnerPatterns, fixes:learnerFixes },
          guardian: { runs:guardianRuns, passed:guardianPassed, failed:guardianFailed },
          rag: { sources:ragSources, chunks:ragStatus.total_chunks||0 },
          documents: { connected:false, docs:0 },
          timestamp: new Date().toISOString()
        });
      } catch(e) { return json(res,500,{error:e.message}); }
    }
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
      if (ragStatus.sources?.pdf?.files > 0)
        sources.push({
          id: 'pdf',
          label: '📄 PDFs',
          connected: true,
          chunks: ragStatus.sources.pdf.chunks,
          files: ragStatus.sources.pdf.files,
          description: 'Uploaded PDF documents — indexed into vault'
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
    if (url==='/api/rag/upload-pdf') {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', async () => {
        try {
          const body = Buffer.concat(chunks);
          const boundary = req.headers['content-type']?.split('boundary=')[1];
          if (!boundary) return json(res, 400, { error: 'No boundary in content-type' });

          // Parse multipart manually (simple single-file case)
          const bnd = Buffer.from('--' + boundary);
          const parts = [];
          let start = body.indexOf(bnd) + bnd.length;
          while (start < body.length) {
            const end = body.indexOf(bnd, start);
            if (end === -1) break;
            parts.push(body.slice(start, end));
            start = end + bnd.length;
          }

          if (!parts.length) return json(res, 400, { error: 'No file found in upload' });

          const part = parts[0];
          const headerEnd = part.indexOf('\r\n\r\n');
          const headers = part.slice(0, headerEnd).toString();
          const fileData = part.slice(headerEnd + 4, part.length - 2);

          const nameMatch = headers.match(/filename="([^"]+)"/);
          const fileName = nameMatch ? nameMatch[1] : 'upload-'+Date.now()+'.pdf';

          if (!fileName.toLowerCase().endsWith('.pdf')) {
            return json(res, 400, { error: 'Only PDF files supported' });
          }

          const uploadDir = path.join(BRAIN, 'intelligence', 'uploads', 'pdf');
          if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, fileData);

          // Extract text with pdf-parse
          let text = '';
          try {
            const pdfParse = require('pdf-parse');
            const parsed = await pdfParse(fileData);
            text = parsed.text || '';
          } catch(e) {
            text = '[PDF text extraction failed — file saved, will retry on next reindex]';
          }

          // Write markdown alongside PDF for RAG indexing
          const mdPath = filePath.replace('.pdf', '.md');
          fs.writeFileSync(mdPath, `# ${fileName}\n\nSource: PDF upload\nUploaded: ${new Date().toISOString()}\n\n${text}`);

          // Trigger RAG reindex
          rag.buildIndex().catch(console.error);

          return json(res, 200, {
            ok: true,
            file: fileName,
            chars: text.length,
            message: text.length > 100
              ? 'PDF indexed into vault — now searchable'
              : 'PDF saved — text extraction limited, basic info indexed'
          });
        } catch(e) {
          return json(res, 500, { error: e.message });
        }
      });
      return;
    }
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
  // Serve HTML — login gate: show login page until first Gmail token exists
  try {
    let pageFile = 'index.html';
    try {
      const tokenDir = path.join(BRAIN, 'integrations');
      const hasToken = fs.existsSync(tokenDir) &&
        fs.readdirSync(tokenDir).some(f => f.startsWith('.gmail-token-') && f.endsWith('.json'));
      if (!hasToken) pageFile = 'login.html';
    } catch {}
    const html = fs.readFileSync(path.join(__dirname, pageFile),'utf8');
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
