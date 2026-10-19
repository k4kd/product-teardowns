#!/usr/bin/env node
// Keeps a local build of REA at its latest GitHub release, with a local fallback.
// - ~/.product-teardowns/rea-src  a full clone of github.com/morluto/rea (survives the repo being taken down)
// - ~/.product-teardowns/rea      the last good build (the MCP server runs from here)
// - ~/.product-teardowns/rea-prev the build before that
// - ~/.product-teardowns/rea-update.log  one line per attempt; rea-build.log  the last build's output
// Never fails the caller: any problem means "keep the last good build". Always exits 0 and prints a JSON summary.
// Env overrides (for tests): PRODUCT_TEARDOWNS_HOME, REA_REPO, REA_SKILL_DIR, REA_BUILD_CMD.
import { spawnSync } from 'node:child_process';
import { appendFileSync, cpSync, existsSync, mkdirSync, openSync, closeSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const BASE = process.env.PRODUCT_TEARDOWNS_HOME || join(homedir(), '.product-teardowns');
const REPO = process.env.REA_REPO || 'https://github.com/morluto/rea.git';
const SKILL_DIR = process.env.REA_SKILL_DIR || join(homedir(), '.claude', 'skills', 'reverse-engineer-anything');
const BUILD = process.env.REA_BUILD_CMD || 'npm ci --no-audit --no-fund && npm run build';
const TAG_PATTERNS = ['rea-agents-*', 'v*']; // REA tags releases as rea-agents-X.Y.Z
const SRC = join(BASE, 'rea-src');
const LIVE = join(BASE, 'rea');
const PREV = join(BASE, 'rea-prev');
const STAGE = join(BASE, 'rea-next');
const LOG = join(BASE, 'rea-update.log');
const BUILD_LOG = join(BASE, 'rea-build.log');
const FAILED = join(BASE, 'rea-failed');
const LOCK = join(BASE, 'rea-update.lock');

const sh = (cmd, args, cwd, timeout = 120_000) =>
  spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout, env: { ...process.env, GIT_TERMINAL_PROMPT: '0' } });
const liveCommit = () => {
  try { return readFileSync(join(LIVE, '.rea-commit'), 'utf8').trim(); } catch { return ''; }
};
const short = (c) => (c ? c.slice(0, 7) : 'none');
let lockFd = null;

function finish(status, detail, extra = {}) {
  const live = liveCommit();
  try { appendFileSync(LOG, `${new Date().toISOString()}  ${status.padEnd(11)} live=${short(live)}  ${detail}\n`); } catch { /* logging must not fail the run */ }
  if (lockFd !== null) { try { closeSync(lockFd); rmSync(LOCK, { force: true }); } catch { /* ignore */ } }
  console.log(JSON.stringify({ status, detail, liveCommit: live, livePath: live ? LIVE : '', log: LOG, ...extra }, null, 2));
  process.exit(0);
}
const fallback = (why) => finish(liveCommit() ? 'fallback' : 'unavailable', `${why}; ${liveCommit() ? 'keeping the last good build' : 'no local build yet, use npx rea-agents@latest'}`);

function main() {
  mkdirSync(BASE, { recursive: true });

  // One run at a time. A lock older than an hour is from a crashed run.
  try { lockFd = openSync(LOCK, 'wx'); } catch {
    let age = 0;
    try { age = Date.now() - statSync(LOCK).mtimeMs; } catch { /* gone already */ }
    if (age < 3_600_000) finish('busy', 'another update is running');
    rmSync(LOCK, { force: true });
    lockFd = openSync(LOCK, 'wx');
  }

  // 1. Fetch GitHub into the local source clone. If GitHub is gone, the clone is the fallback.
  if (!existsSync(join(SRC, '.git'))) {
    if (sh('git', ['clone', '--quiet', REPO, SRC], BASE, 600_000).status !== 0) {
      rmSync(SRC, { recursive: true, force: true });
      fallback(`could not clone ${REPO}`);
    }
  } else if (sh('git', ['fetch', '--quiet', '--tags', '--force', 'origin'], SRC, 300_000).status !== 0) {
    fallback(`could not reach ${REPO}, keeping the local source`);
  }

  // 2. Pick the newest release tag; with no tags, the default branch.
  const tag = sh('git', ['tag', '--sort=-v:refname', '-l', ...TAG_PATTERNS], SRC).stdout.split('\n').find(Boolean) || '';
  const verify = (ref) => {
    const r = sh('git', ['rev-parse', '--verify', '-q', `${ref}^{commit}`], SRC);
    return r.status === 0 ? r.stdout.trim() : '';
  };
  const head = tag ? verify(tag) : (verify('origin/HEAD') || verify('origin/main'));
  const label = tag || 'default branch (no release tags)';
  if (!head) fallback('could not resolve the latest release');
  sh('git', ['checkout', '--quiet', '--detach', head], SRC); // keep the local copy at the release being used

  // 3. Nothing new, or a release that already failed to build: done.
  if (head === liveCommit()) finish('unchanged', `already at ${label} (${short(head)})`, { tag });
  let failed = '';
  try { failed = readFileSync(FAILED, 'utf8').trim(); } catch { /* none */ }
  if (head === failed) finish(liveCommit() ? 'fallback' : 'unavailable', `${label} (${short(head)}) failed to build before; waiting for the next release`, { tag });

  // 4. Build in a staging copy; only a build that passes the smoke test goes live.
  rmSync(STAGE, { recursive: true, force: true });
  if (sh('git', ['clone', '--quiet', '--no-hardlinks', SRC, STAGE], BASE, 300_000).status !== 0 ||
      sh('git', ['checkout', '--quiet', '--detach', head], STAGE).status !== 0) {
    rmSync(STAGE, { recursive: true, force: true });
    fallback(`could not stage ${label}`);
  }
  const out = openSync(BUILD_LOG, 'w');
  const build = spawnSync(BUILD, { cwd: STAGE, shell: true, stdio: ['ignore', out, out], timeout: 1_800_000 });
  closeSync(out);
  const version = build.status === 0 ? sh(process.execPath, ['scripts/rea.mjs', '--version'], STAGE) : null;
  if (!version || version.status !== 0) {
    writeFileSync(FAILED, `${head}\n`);
    rmSync(STAGE, { recursive: true, force: true });
    fallback(`build of ${label} failed (output in ${BUILD_LOG})`);
  }
  writeFileSync(join(STAGE, '.rea-commit'), `${head}\n`);

  // 5. Swap rea -> rea-prev, rea-next -> rea, rolling back if the second step fails.
  // ponytail: a running MCP server keeps its old process; the new build is used from the next session or /mcp reconnect.
  const old = liveCommit();
  rmSync(PREV, { recursive: true, force: true });
  if (existsSync(LIVE)) renameSync(LIVE, PREV);
  try { renameSync(STAGE, LIVE); } catch (e) {
    if (existsSync(PREV) && !existsSync(LIVE)) renameSync(PREV, LIVE);
    fallback(`could not swap in the new build (${e.code || e.message})`);
  }

  // 6. Refresh the installed REA skill from the build: copy beside it, then swap, so it is never missing.
  let skill = 'not found in build';
  const skillSrc = join(LIVE, '.agents', 'skills', 'reverse-engineer-anything');
  if (existsSync(join(skillSrc, 'SKILL.md'))) {
    try {
      const fresh = `${SKILL_DIR}.new`;
      const backup = join(BASE, 'skill-backup', 'reverse-engineer-anything');
      rmSync(fresh, { recursive: true, force: true });
      mkdirSync(join(SKILL_DIR, '..'), { recursive: true });
      cpSync(skillSrc, fresh, { recursive: true });
      if (existsSync(SKILL_DIR)) {
        rmSync(backup, { recursive: true, force: true });
        mkdirSync(join(backup, '..'), { recursive: true });
        renameSync(SKILL_DIR, backup);
      }
      renameSync(fresh, SKILL_DIR);
      skill = SKILL_DIR;
    } catch (e) {
      skill = `not refreshed (${e.code || e.message})`;
    }
  }
  rmSync(FAILED, { force: true });
  finish('updated', `${short(old)} -> ${label} (${short(head)}, ${version.stdout.trim() || 'version unknown'}); skill: ${skill}`,
    { tag, version: version.stdout.trim(), skill });
}

try { main(); } catch (e) { fallback(`unexpected error: ${e.message}`); }
