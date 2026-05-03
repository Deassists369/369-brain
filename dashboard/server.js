const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BRAIN = path.join(os.homedir(), 'deassists-workspace', '369-brain');
const RUNS_DIR = path.join(BRAIN, 'intelligence', 'harness-runs');
const PORT = 3369;

function readJSONL(file) {
  try {
    const content = fs.readFileSync(file, 'utf8');
    return content.trim().split('\n').filter(Boolean).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch { return []; }
}

function getData() {
  const eagle = readJSONL(path.join(RUNS_DIR, 'eagle-harness.jsonl'));
  const test = readJSONL(path.join(RUNS_DIR, 'test-harness.jsonl'));
  const selfImprove = readJSONL(path.join(RUNS_DIR, 'self-improvement.jsonl'));
  
  const ticketsOpen = fs.existsSync(path.join(BRAIN, 'tickets', 'open')) 
    ? fs.readdirSync(path.join(BRAIN, 'tickets', 'open')).filter(f => f.endsWith('.md')) : [];
  const ticketsAwaiting = fs.existsSync(path.join(BRAIN, 'tickets', 'awaiting-approval'))
    ? fs.readdirSync(path.join(BRAIN, 'tickets', 'awaiting-approval')).filter(f => f.endsWith('.md')) : [];
  const ticketsComplete = fs.existsSync(path.join(BRAIN, 'tickets', 'complete'))
    ? fs.readdirSync(path.join(BRAIN, 'tickets', 'complete')).filter(f => f.endsWith('.md')) : [];

  return { eagle, test, selfImprove, ticketsOpen, ticketsAwaiting, ticketsComplete, timestamp: new Date().toISOString() };
}

const server = http.createServer((req, res) => {
  if (req.url === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(getData()));
    return;
  }
  const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(html);
});

server.listen(PORT, () => console.log(`DeAssists 369 Monitor → http://localhost:${PORT}`));
