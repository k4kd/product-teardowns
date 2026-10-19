#!/usr/bin/env node
// Publishes one mode of a product-teardowns run into the learning journal (<journal>/<mode>/):
// fills in the doc's readability line, copies the doc, appends ledger rows and the index line,
// raises levels by the level rule, then commits and pushes (never force).
// Usage: node publish.mjs --run ~/teardowns/<slug>/run/<mode>   (PRODUCT_TEARDOWNS_JOURNAL overrides ~/learning-journal)
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, isAbsolute, join, resolve } from 'node:path';

// Level areas per mode, as in the contracts. Area names are unique across modes.
const MODES = {
  technical: ['Systems/infra', 'Algorithms', 'Code'],
  product: ['Product sense', 'Growth', 'Business', 'Data'],
  design: ['Interaction & UX', 'Visual & UI craft', 'Systems & accessibility', 'Research & content'],
};
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const levelFor = (count) => (count >= 15 ? 2 : count >= 5 ? 1 : 0); // the contract's level rule

const fail = (msg) => { console.error(`✗ ${msg}`); process.exit(1); };
const git = (args, cwd) => spawnSync('git', args, { cwd, encoding: 'utf8', env: { ...process.env, GIT_LITERAL_PATHSPECS: '1' } });

const runArg = process.argv.indexOf('--run');
if (runArg < 0 || !process.argv[runArg + 1]) fail('Usage: node publish.mjs --run <run folder>/<mode>');
const RUN = resolve(process.argv[runArg + 1].replace(/^~(?=\/|$)/, homedir()));
const JOURNAL = process.env.PRODUCT_TEARDOWNS_JOURNAL || join(homedir(), 'learning-journal');
if (!existsSync(join(JOURNAL, '.git'))) fail(`No journal repo at ${JOURNAL}. Run setup first.`);

// --- inputs
let meta;
try { meta = JSON.parse(readFileSync(join(RUN, 'publish.json'), 'utf8')); } catch (e) { fail(`Cannot read ${RUN}/publish.json: ${e.message}`); }
const { mode = 'technical', slug, target, version = '', lesson = '', newConcepts = [] } = meta;
if (!Object.hasOwn(MODES, mode)) fail(`publish.json mode must be one of ${Object.keys(MODES).join(', ')}, got "${mode}"`);
if (basename(RUN) !== mode) fail(`publish.json says mode "${mode}" but the folder is "${basename(RUN)}"; pass --run <run>/${mode}`);
const AREAS = MODES[mode];
const MODE_DIR = join(JOURNAL, mode);
if (!/^\d{4}-\d{2}-\d{2}-[a-z0-9][a-z0-9-]*$/.test(slug || '')) fail(`publish.json slug must look like 2026-10-19-name, got "${slug}"`);
if (typeof target !== 'string' || !target.trim()) fail('publish.json needs a target');
if (!Array.isArray(newConcepts)) fail('publish.json newConcepts must be a list');
for (const c of newConcepts) {
  if (typeof c?.name !== 'string' || !c.name.trim() || !AREAS.includes(c.area)) fail(`Bad concept ${JSON.stringify(c)}: needs a name and an area of ${AREAS.join(', ')}`);
}
if (!existsSync(join(RUN, 'doc.md'))) fail(`No doc.md in ${RUN}`);

// --- readability line: the highest-numbered readability-<n>.md wins
const runs = readdirSync(RUN).map((f) => f.match(/^readability-(\d+)\.md$/)).filter(Boolean).map((m) => +m[1]);
let readability = 'Readability: not run';
if (runs.length) {
  const n = Math.max(...runs);
  const r = readFileSync(join(RUN, `readability-${n}.md`), 'utf8');
  const field = (re) => r.match(re)?.[1]?.trim() ?? '?';
  readability = `Readability: ${field(/Verdict:\s*(\w+)/)} on run ${n} (fresh Haiku reader), score ${field(/Score:\s*([\d.]+)/)}/10, ${field(/Answers correct:\s*([\d/]+)/)} answers correct`;
}
let doc = readFileSync(join(RUN, 'doc.md'), 'utf8');
doc = /^- Readability:.*$/m.test(doc) ? doc.replace(/^- Readability:.*$/m, `- ${readability}`) : `${doc.trimEnd()}\n- ${readability}\n`;
writeFileSync(join(RUN, 'doc.md'), doc);

// --- sync first, so appends land on the latest journal
const hasRemote = git(['remote', 'get-url', 'origin'], JOURNAL).status === 0;
// A conflicted rebase is aborted, so the journal is never left half-rebased.
const pull = () => git(['pull', '--rebase', '--autostash', '--quiet'], JOURNAL).status === 0 || (git(['rebase', '--abort'], JOURNAL), false);
if (hasRemote && !pull()) console.error('! Pull failed; publishing on the local copy.');

const today = new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD
const docPath = `teardowns/${slug}.md`; // relative to the mode folder, as the ledger and index link it
mkdirSync(join(MODE_DIR, 'teardowns'), { recursive: true });
// Local images the doc embeds (design screenshots) are copied beside it, and their links rewritten.
const assets = [];
const copied = new Map(); // source -> published name, so an image embedded twice is copied once
const assetDir = `${slug}-assets`;
const runRoot = realpathSync(resolve(RUN, '..')); // run/, which holds findings/screens/
const published = doc.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (whole, alt, src) => {
  if (/^[a-z]+:/i.test(src)) return whole; // http(s) and data URLs stay as they are
  // Only real image files from inside this run's folder: the doc was written by a model that read untrusted content,
  // and anything copied here gets pushed to GitHub.
  let from;
  try { from = realpathSync(isAbsolute(src) ? src : resolve(RUN, src)); } catch { return whole; }
  const ok = from.startsWith(`${runRoot}/`) && /\.(png|jpe?g|gif|webp)$/i.test(from) &&
    statSync(from).isFile() && statSync(from).size <= 10 * 1024 * 1024;
  if (!ok) { console.error(`! Not copying ${src}: only images under 10 MB inside the run folder are published.`); return whole; }
  if (!copied.has(from)) {
    const name = `${String(copied.size + 1).padStart(2, '0')}-${basename(from)}`;
    mkdirSync(join(MODE_DIR, 'teardowns', assetDir), { recursive: true });
    copyFileSync(from, join(MODE_DIR, 'teardowns', assetDir, name));
    copied.set(from, name);
    assets.push(`${mode}/teardowns/${assetDir}/${name}`);
  }
  return `![${alt}](${assetDir}/${copied.get(from)})`;
});
writeFileSync(join(MODE_DIR, docPath), published);
const ledgerFile = join(MODE_DIR, 'ledger.md');
if (!existsSync(ledgerFile)) {
  writeFileSync(ledgerFile, `# Ledger (${mode})\n\nEvery concept learnt, one row each. A concept appears once, under the product where it was first learnt.\n\n| Concept | Area | Learnt from | Date | Doc |\n|---|---|---|---|---|\n`);
}

// --- ledger: one row per concept, never duplicated (case-insensitive name match)
let ledger = readFileSync(ledgerFile, 'utf8');
const rows = () => ledger.split('\n').filter((l) => l.startsWith('|') && !/^\|\s*(Concept|-+)\s*\|/.test(l))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim())).filter((r) => r.length >= 2);
const known = new Set(rows().map((r) => r[0].toLowerCase()));
const cell = (s) => String(s).replace(/\|/g, '/').replace(/\s+/g, ' ').trim();
const added = [];
for (const c of newConcepts) {
  const key = cell(c.name).toLowerCase(); // compare as stored, after escaping
  if (known.has(key)) continue;
  known.add(key);
  added.push(c.name);
  ledger = `${ledger.trimEnd()}\n| ${cell(c.name)} | ${c.area} | ${cell(`${target} ${version}`)} | ${today} | [doc](${docPath}) |\n`;
}
writeFileSync(ledgerFile, ledger);

// --- index line, once per doc
const indexFile = join(MODE_DIR, 'teardowns.md');
const index = existsSync(indexFile) ? readFileSync(indexFile, 'utf8') : `# Teardowns (${mode})\n\n`;
if (!index.includes(`(${docPath})`)) {
  writeFileSync(indexFile, `${index.trimEnd()}\n- ${today} · ${cell(target)}${version ? ` (${cell(version)})` : ''} · Lesson: ${cell(lesson)} · [doc](${docPath})\n`);
}

// --- levels only rise
const profileFile = join(JOURNAL, 'profile.md');
const raised = [];
if (existsSync(profileFile)) {
  let profile = readFileSync(profileFile, 'utf8');
  const counts = Object.fromEntries(AREAS.map((a) => [a, rows().filter((r) => r[1] === a).length]));
  for (const area of AREAS) {
    const re = new RegExp(`^(${area.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')}):\\s*(\\w+)`, 'm');
    const m = profile.match(re);
    const now = m ? LEVELS.findIndex((l) => l.toLowerCase() === m[2].toLowerCase()) : -1;
    if (now < 0) { if (m) console.error(`! Unknown level "${m[2]}" for ${area}; left as is.`); continue; }
    const next = Math.max(now, levelFor(counts[area]));
    if (next > now) {
      profile = profile.replace(re, `$1: ${LEVELS[next]}`);
      raised.push(`- ${today}: ${area} ${LEVELS[now]} → ${LEVELS[next]} (${counts[area]} concepts, latest from ${cell(target)})`);
    }
  }
  if (raised.length) {
    profile = profile.includes('## Level history') ? `${profile.trimEnd()}\n${raised.join('\n')}\n` : `${profile.trimEnd()}\n\n## Level history\n${raised.join('\n')}\n`;
    writeFileSync(profileFile, profile);
  }
}

// --- commit and push
// ledger.md and teardowns.md only ever get lines appended, so a union merge resolves two devices' appends.
const attrFile = join(JOURNAL, '.gitattributes');
const attrs = existsSync(attrFile) ? readFileSync(attrFile, 'utf8') : '';
if (!attrs.includes('**/ledger.md merge=union')) writeFileSync(attrFile, `${attrs}${attrs && !attrs.endsWith('\n') ? '\n' : ''}**/ledger.md merge=union\n**/teardowns.md merge=union\n`);

const paths = [`${mode}/${docPath}`, `${mode}/ledger.md`, `${mode}/teardowns.md`, '.gitattributes', ...assets, ...(existsSync(profileFile) ? ['profile.md'] : [])];
if (git(['add', '--', ...paths], JOURNAL).status !== 0) fail('git add failed in the journal.');
let pushed = 'no remote';
if (git(['diff', '--cached', '--quiet', '--', ...paths], JOURNAL).status !== 0) {
  const msg = `${slug.slice(0, 10)} ${target} (${mode}): ${added.length ? added.join(', ') : 'doc update'}`;
  if (git(['commit', '-q', '-m', msg, '--', ...paths], JOURNAL).status !== 0) fail('git commit failed in the journal.');
}
if (hasRemote) {
  const push = () => git(['push', '-q', '-u', 'origin', 'HEAD'], JOURNAL).status === 0;
  pushed = push() || (pull() && push()) ? 'yes' : 'FAILED';
}

console.log(JSON.stringify({ mode, doc: join(MODE_DIR, docPath), assets: assets.length, added, raised: raised.map((l) => l.slice(14)), readability, pushed }, null, 2));
if (pushed === 'FAILED') process.exitCode = 2;
