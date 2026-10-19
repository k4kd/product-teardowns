#!/usr/bin/env node
// Moves a v3 (flat) learning journal to the per-mode layout. Safe to run every session: it does nothing once migrated.
//   ledger.md, teardowns.md, teardowns/  ->  technical/ledger.md, technical/teardowns.md, technical/teardowns/
//   profile.md "## Levels"               ->  "## Technical levels"
// Doc links stay valid, because they are relative ("teardowns/<slug>.md") and move with their ledger.
// Commits the move and pushes if there is a remote. Prints a JSON summary; exit 1 only on a git error.
// Usage: node migrate-journal.mjs   (PRODUCT_TEARDOWNS_JOURNAL overrides ~/learning-journal)
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const JOURNAL = process.env.PRODUCT_TEARDOWNS_JOURNAL || join(homedir(), 'learning-journal');
const git = (args) => spawnSync('git', args, { cwd: JOURNAL, encoding: 'utf8' });
const done = (status, extra = {}) => { console.log(JSON.stringify({ status, journal: JOURNAL, ...extra })); process.exit(0); };

if (!existsSync(join(JOURNAL, '.git'))) done('no-journal');
const isEmptyDir = (p) => { try { return readdirSync(p).length === 0; } catch { return false; } };
const flat = ['ledger.md', 'teardowns.md', 'teardowns'].filter((f) => existsSync(join(JOURNAL, f)) && !isEmptyDir(join(JOURNAL, f)));
const profileFile = join(JOURNAL, 'profile.md');
const profile = existsSync(profileFile) ? readFileSync(profileFile, 'utf8') : '';
const oldProfile = /^## Levels\r?$/m.test(profile);
if (!flat.length && !oldProfile) done('already-migrated');
// Check every destination before moving anything, so a half-migrated tree can't happen.
const clash = flat.filter((f) => existsSync(join(JOURNAL, 'technical', f)));
if (clash.length) {
  console.error(`✗ Both ${clash.join(', ')} and technical/${clash.join(', technical/')} exist. Merge them by hand, then re-run.`);
  process.exit(1);
}

mkdirSync(join(JOURNAL, 'technical'), { recursive: true });
const trackedFlat = [];
for (const f of flat) {
  const tracked = git(['ls-files', '--error-unmatch', f]).status === 0;
  let moved = false;
  if (tracked) { moved = git(['mv', f, `technical/${f}`]).status === 0; trackedFlat.push(f); }
  else { try { renameSync(join(JOURNAL, f), join(JOURNAL, 'technical', f)); moved = true; } catch { /* reported below */ } }
  if (!moved) { console.error(`✗ Could not move ${f} into technical/.`); process.exit(1); }
}
const retitle = (file, from, to) => {
  const p = join(JOURNAL, 'technical', file);
  if (existsSync(p)) writeFileSync(p, readFileSync(p, 'utf8').replace(new RegExp(`^# ${from}$`, 'm'), `# ${to}`));
};
retitle('ledger.md', 'Ledger', 'Ledger (technical)');
retitle('teardowns.md', 'Teardowns', 'Teardowns (technical)');
if (oldProfile) writeFileSync(profileFile, profile.replace(/^## Levels(\r?)$/m, '## Technical levels$1'));

// Only this migration's paths are staged and committed, never anything else the user had staged.
const paths = ['technical', ...trackedFlat, ...(oldProfile ? ['profile.md'] : [])];
if (git(['add', '-A', '--', 'technical', ...(oldProfile ? ['profile.md'] : [])]).status !== 0) {
  console.error('✗ git add failed in the journal. Fix it and commit technical/ by hand.');
  process.exit(1);
}
if (git(['diff', '--cached', '--quiet', '--', ...paths]).status !== 0 &&
    git(['commit', '-q', '-m', 'Move technical learnings into technical/ (per-mode layout)', '--', ...paths]).status !== 0) {
  console.error('✗ git commit failed in the journal. Fix it and commit technical/ by hand.');
  process.exit(1);
}
const hasRemote = git(['remote', 'get-url', 'origin']).status === 0;
const pushed = !hasRemote ? 'no remote'
  : git(['push', '-q', '-u', 'origin', 'HEAD']).status === 0 ? 'yes' : 'FAILED (the next publish pushes again)';
done('migrated', { moved: flat, profile: oldProfile, pushed });
