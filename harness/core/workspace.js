// harness/core/workspace.js
// Manages tickets and previews for any harness.
// Tickets flow: tickets/open → tickets/awaiting-approval → tickets/complete.
// Previews live in 369-brain/previews/[name].html.
// Owner: Shon AJ | Brain: VEERABHADRA

const fs = require('fs');
const path = require('path');

const BRAIN_ROOT = path.join(process.env.HOME, 'deassists-workspace', '369-brain');
const TICKETS_ROOT = path.join(BRAIN_ROOT, 'tickets');
const PREVIEWS_ROOT = path.join(BRAIN_ROOT, 'previews');

const STATES = ['open', 'awaiting-approval', 'complete'];

function ensureDirs() {
  STATES.forEach((s) => {
    const dir = path.join(TICKETS_ROOT, s);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
  if (!fs.existsSync(PREVIEWS_ROOT)) fs.mkdirSync(PREVIEWS_ROOT, { recursive: true });
}

function ticketDir(state) {
  if (!STATES.includes(state)) {
    throw new Error(`Unknown ticket state: ${state}. Allowed: ${STATES.join(', ')}`);
  }
  return path.join(TICKETS_ROOT, state);
}

// List ticket file names (without extension) in a given state folder.
function listTickets(state = 'open') {
  ensureDirs();
  const dir = ticketDir(state);
  return fs.readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

// Read a ticket's markdown body. Returns null if not found in the requested state.
function readTicket(name, state = 'open') {
  ensureDirs();
  const file = path.join(ticketDir(state), `${name}.md`);
  if (!fs.existsSync(file)) return null;
  return fs.readFileSync(file, 'utf8');
}

// Move a ticket from one state to another.
function moveTicket(name, fromState, toState) {
  ensureDirs();
  const fromFile = path.join(ticketDir(fromState), `${name}.md`);
  const toFile = path.join(ticketDir(toState), `${name}.md`);
  if (!fs.existsSync(fromFile)) {
    throw new Error(`Cannot move ticket: ${fromFile} not found`);
  }
  fs.renameSync(fromFile, toFile);
  return toFile;
}

// Save an HTML preview to the previews folder. Returns absolute path.
function savePreview(name, html) {
  ensureDirs();
  const file = path.join(PREVIEWS_ROOT, `${name}.html`);
  fs.writeFileSync(file, html, 'utf8');
  return file;
}

function previewPath(name) {
  return path.join(PREVIEWS_ROOT, `${name}.html`);
}

function previewExists(name) {
  return fs.existsSync(previewPath(name));
}

// Save raw phase output (text/markdown/json) next to the ticket so it can be inspected.
// Files land in 369-brain/intelligence/harness-runs/output/[ticket]/[phase].txt
function savePhaseOutput(ticketName, phaseName, content) {
  const baseDir = path.join(BRAIN_ROOT, 'intelligence', 'harness-runs', 'output', ticketName);
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  const safePhase = phaseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const file = path.join(baseDir, `${safePhase}.txt`);
  fs.writeFileSync(file, content, 'utf8');
  return file;
}

module.exports = {
  STATES,
  TICKETS_ROOT,
  PREVIEWS_ROOT,
  listTickets,
  readTicket,
  moveTicket,
  savePreview,
  previewPath,
  previewExists,
  savePhaseOutput,
};
