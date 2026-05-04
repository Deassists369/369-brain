const { google } = require('googleapis');
const { OAuth2Client } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const os = require('os');

const BRAIN = path.join(os.homedir(),'deassists-workspace','369-brain');
const CREDS_PATH = path.join(BRAIN,'integrations','gmail-credentials.json');
const TOKENS_DIR = path.join(BRAIN,'integrations');
const GMAIL_DIR = path.join(BRAIN,'intelligence','gmail');
const REDIRECT = 'http://localhost:3369/api/gmail/auth-callback';
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

function createClient(){
  const raw = JSON.parse(fs.readFileSync(CREDS_PATH,'utf8'));
  const c = raw.web||raw.installed;
  return new OAuth2Client(c.client_id,c.client_secret,REDIRECT);
}

function tokenPath(email){
  return path.join(TOKENS_DIR,'.gmail-token-'+email.replace('@','_at_')+'.json');
}

function getConnectedAccounts(){
  try{
    return fs.readdirSync(TOKENS_DIR)
      .filter(f=>f.startsWith('.gmail-token-')&&f.endsWith('.json'))
      .map(f=>f.replace('.gmail-token-','').replace('.json','').replace('_at_','@'));
  }catch{return[];}
}

async function getClient(email){
  const tp = tokenPath(email);
  if(!fs.existsSync(tp)) throw new Error('No token for '+email);
  const tokens = JSON.parse(fs.readFileSync(tp,'utf8'));
  const client = createClient();
  client.setCredentials(tokens);
  client.on('tokens',t=>{
    if(t.refresh_token) tokens.refresh_token=t.refresh_token;
    Object.assign(tokens,t);
    fs.writeFileSync(tp,JSON.stringify(tokens,null,2));
  });
  return client;
}

async function syncAccount(email, max=200){
  console.log('[Gmail] Syncing:',email);
  const client = await getClient(email);
  const gmail = google.gmail({version:'v1',auth:client});
  const dir = path.join(GMAIL_DIR,email.replace('@','_at_'));
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
  const list = await gmail.users.messages.list({
    userId:'me', maxResults:max, q:'in:inbox OR in:sent'
  });
  const messages = list.data.messages||[];
  console.log('[Gmail] Fetching',messages.length,'messages');
  let indexed=0;
  for(const msg of messages){
    const outPath = path.join(dir,msg.id+'.md');
    if(fs.existsSync(outPath)) continue;
    try{
      const full = await gmail.users.messages.get({
        userId:'me',id:msg.id,format:'full'
      });
      const headers = full.data.payload?.headers||[];
      const get = name => headers.find(h=>h.name===name)?.value||'';
      const subject = get('Subject')||'(no subject)';
      const from = get('From');
      const to = get('To');
      const date = get('Date');
      let body='';
      const findBody = parts=>{
        for(const p of parts||[]){
          if(p.mimeType==='text/plain'&&p.body?.data){
            body=Buffer.from(p.body.data,'base64').toString('utf8').slice(0,1500);
            return;
          }
          if(p.parts) findBody(p.parts);
        }
      };
      findBody(full.data.payload?.parts||[full.data.payload]);
      const md = `# ${subject}\n\nFrom: ${from}\nTo: ${to}\nDate: ${date}\nAccount: ${email}\nMessage-ID: ${msg.id}\n\n${body}`;
      fs.writeFileSync(outPath,md);
      indexed++;
    }catch{}
  }
  console.log('[Gmail] Indexed',indexed,'new messages for',email);
  return indexed;
}

async function syncAll(){
  const accounts=getConnectedAccounts();
  for(const email of accounts) await syncAccount(email);
}

module.exports={syncAccount,syncAll,getConnectedAccounts,createClient,tokenPath};
