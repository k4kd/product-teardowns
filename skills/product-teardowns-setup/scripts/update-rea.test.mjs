// Self-check for update-rea.mjs: node update-rea.test.mjs
// Uses a fake REA repo, so nothing is downloaded or built for real.
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'pt-rea-'));
const repo = join(dir, 'fake-rea');
const gitEnv = { GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const git = (...args) => spawnSync('git', args, { cwd: repo, encoding: 'utf8', env: { ...process.env, ...gitEnv } });
const commit = (version, tag) => {
  writeFileSync(join(repo, 'scripts', 'rea.mjs'), `console.log('${version}')\n`);
  writeFileSync(join(repo, '.agents', 'skills', 'reverse-engineer-anything', 'SKILL.md'), `# REA ${version}\n`);
  git('add', '-A'); git('commit', '-q', '-m', version);
  if (tag) git('tag', tag);
  return git('rev-parse', 'HEAD').stdout.trim();
};
mkdirSync(join(repo, 'scripts'), { recursive: true });
mkdirSync(join(repo, '.agents', 'skills', 'reverse-engineer-anything'), { recursive: true });
git('init', '-q', '-b', 'main');
const c1 = commit('6.7.0', 'rea-agents-6.7.0');
commit('6.8.0-dev'); // untagged work on main is never built

const home = join(dir, 'home');
const skillDir = join(dir, 'skills', 'reverse-engineer-anything');
const script = new URL('./update-rea.mjs', import.meta.url).pathname;
const run = (build = 'true', repoUrl = repo) => {
  const r = spawnSync('node', [script], { encoding: 'utf8', env: { ...process.env, PRODUCT_TEARDOWNS_HOME: home, REA_REPO: repoUrl, REA_SKILL_DIR: skillDir, REA_BUILD_CMD: build } });
  assert.equal(r.status, 0, `must always exit 0: ${r.stderr}`);
  return JSON.parse(r.stdout);
};

let out = run();
assert.equal(out.status, 'updated');
assert.equal(out.liveCommit, c1, 'builds the latest release tag, not main');
assert.equal(out.tag, 'rea-agents-6.7.0');
assert.match(readFileSync(join(skillDir, 'SKILL.md'), 'utf8'), /6\.7\.0/, 'skill copied from the build');

assert.equal(run().status, 'unchanged');

const c2 = commit('6.8.0', 'rea-agents-6.8.0');
out = run('false'); // the build fails
assert.equal(out.status, 'fallback');
assert.equal(out.liveCommit, c1, 'a failed build leaves the last good build live');
out = run();
assert.equal(out.status, 'fallback', 'a release that failed is not rebuilt every run');
assert.match(out.detail, /failed to build before/);

const c3 = commit('6.8.1', 'rea-agents-6.8.1');
out = run();
assert.equal(out.status, 'updated');
assert.equal(out.liveCommit, c3);
assert.notEqual(c2, c3);
assert.equal(readFileSync(join(home, 'rea-prev', '.rea-commit'), 'utf8').trim(), c1, 'previous build kept');
assert.match(readFileSync(join(home, 'skill-backup', 'reverse-engineer-anything', 'SKILL.md'), 'utf8'), /6\.7\.0/, 'old skill backed up');

writeFileSync(join(home, 'rea-update.lock'), '');
assert.equal(run().status, 'busy', 'a second run waits for the first');
spawnSync('rm', ['-f', join(home, 'rea-update.lock')]);

renameSync(repo, `${repo}-gone`); // the GitHub repo is taken down
out = run('true', repo);
assert.equal(out.status, 'fallback');
assert.equal(out.liveCommit, c3, 'still using the local build');
assert.match(readFileSync(join(home, 'rea-src', 'scripts', 'rea.mjs'), 'utf8'), /6\.8\.1/, 'local source is at the latest release');

const log = readFileSync(join(home, 'rea-update.log'), 'utf8').trim().split('\n');
assert.equal(log.length, 7, 'one log line per attempt');
console.log('update-rea.mjs self-check passed');
