#!/usr/bin/env node
// One-time setup: installs the skill, REA (optional), the private journal repo and the learner profile.
// Run with: npx github:k4kd/reverse-learn-kunal
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';

const SOURCE = 'k4kd/reverse-learn-kunal';
const JOURNAL = join(homedir(), 'learning-journal');
const interactive = process.stdin.isTTY;
const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;

// npx is a .cmd shim on Windows, so it needs a shell there; git and gh never do.
const run = (cmd, args, opts = {}) =>
  spawnSync(cmd, args, { stdio: 'inherit', shell: cmd === 'npx' && process.platform === 'win32', ...opts }).status === 0;
const read = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : '';
};

const ok = (cmd, args) => spawnSync(cmd, args, { stdio: 'ignore' }).status === 0;

async function ask(question, fallback) {
  if (!interactive) return fallback;
  const answer = (await rl.question(`${question} `)).trim();
  return answer || fallback;
}
const yes = async (question, fallback) =>
  /^y/i.test(await ask(`${question} [${fallback ? 'Y/n' : 'y/N'}]`, fallback ? 'y' : 'n'));

function stop(message) {
  console.error(`\n✗ ${message}`);
  rl?.close();
  process.exit(1);
}

async function setupJournal() {
  if (existsSync(JOURNAL)) {
    if (!existsSync(join(JOURNAL, '.git'))) stop(`${JOURNAL} exists but is not a git repo. Move it aside, then re-run setup.`);
    const remote = read('git', ['-C', JOURNAL, 'remote', 'get-url', 'origin']);
    if (remote) return console.log(`✓ Journal already exists at ${JOURNAL} and syncs with ${remote}.`);
    console.log(`Your journal at ${JOURNAL} has no GitHub repo yet, so docs cannot be pushed.`);
    if (await yes('Create a private GitHub repo for it now?', true)) await createRepo();
    return;
  }
  console.log(`\nYour learning journal is a private GitHub repo. It holds every teardown doc and the ledger of what you have learnt.
  1. Create a new private GitHub repo (first device)
  2. Clone the journal repo you already have (another device)`);
  const choice = await ask('Choose 1 or 2 [1]:', '1');

  if (choice === '2') {
    const url = await ask('Journal repo URL (https://github.com/<you>/<repo>.git):', '');
    if (!/^(https:\/\/|git@)\S+$/.test(url)) stop('That does not look like a git URL. Re-run setup to try again.');
    if (!run('git', ['clone', url, JOURNAL])) stop('Clone failed. Check the URL and your GitHub access, then re-run setup.');
    console.log(`✓ Journal cloned to ${JOURNAL}.`);
    return;
  }

  if (!ok('gh', ['auth', 'status'])) stop('GitHub CLI is not logged in. Install it from https://cli.github.com, run `gh auth login`, then re-run setup.');
  mkdirSync(join(JOURNAL, 'teardowns'), { recursive: true });
  writeFileSync(join(JOURNAL, 'README.md'),
    '# Learning journal\n\nWritten by the reverse-learn-kunal skill: profile.md (levels), ledger.md (concepts learnt), teardowns.md (index) and teardowns/ (the docs).\n');
  if (!run('git', ['init', '-q', '-b', 'main'], { cwd: JOURNAL }) ||
      !run('git', ['add', '-A'], { cwd: JOURNAL }) ||
      !run('git', ['commit', '-q', '-m', 'Start learning journal'], { cwd: JOURNAL })) {
    stop(`Could not create the journal's first commit in ${JOURNAL}.`);
  }
  await createRepo();
}

async function createRepo() {
  if (!ok('gh', ['auth', 'status'])) stop('GitHub CLI is not logged in. Install it from https://cli.github.com, run `gh auth login`, then re-run setup.');
  const repoName = await ask('Name for the private repo [learning-journal]:', 'learning-journal');
  if (!/^[A-Za-z0-9_][A-Za-z0-9._-]*$/.test(repoName) || repoName === '..') stop('Repo names may only use letters, numbers, dot, dash and underscore, and must start with a letter, number or underscore.');
  if (!run('gh', ['repo', 'create', repoName, '--private', '--source', JOURNAL, '--push'])) {
    stop(`Could not create the GitHub repo. The journal still exists locally at ${JOURNAL}; re-run setup to try again.`);
  }
  console.log(`✓ Journal at ${JOURNAL} pushed to a private GitHub repo.`);
}

const LEVELS = { b: 'Beginner', i: 'Intermediate', a: 'Advanced' };
const level = async (area) => LEVELS[(await ask(`Your level in ${area}? (b)eginner / (i)ntermediate / (a)dvanced [b]:`, 'b'))[0]?.toLowerCase()] ?? 'Beginner';

// Writes only the files that are missing, so a cloned journal keeps its history.
async function setupLedger() {
  const today = new Date().toISOString().slice(0, 10);
  const files = {};
  if (!existsSync(join(JOURNAL, 'profile.md'))) {
    if (!interactive) {
      console.log('No terminal, so your level is not set yet. The skill will ask on its first run.');
    } else {
      console.log('\nA few questions so the docs start at your level.');
      const sys = await level('systems and infrastructure');
      const algo = await level('algorithms');
      const code = await level('reading and writing code');
      const goal = await ask('What do you want to be able to do in a year?', 'Build and ship my own products');
      const depth = await ask('How deep should explanations go by default?', 'Deep: internals, trade-offs and code-level detail');
      files['profile.md'] = `# Learner Profile\n\n## Levels\nSystems/infra: ${sys}\nAlgorithms: ${algo}\nCode: ${code}\nDefault depth: ${depth}\n\n## Goal\n${goal}\n\n## Level history\n- ${today}: started at Systems/infra ${sys}, Algorithms ${algo}, Code ${code} (setup)\n`;
    }
  }
  if (!existsSync(join(JOURNAL, 'ledger.md'))) {
    files['ledger.md'] = '# Ledger\n\nEvery concept learnt, one row each. A concept appears once, under the product where it was first learnt.\n\n| Concept | Area | Learnt from | Date | Doc |\n|---|---|---|---|---|\n';
  }
  if (!existsSync(join(JOURNAL, 'teardowns.md'))) files['teardowns.md'] = '# Teardowns\n\n';
  for (const [name, body] of Object.entries(files)) writeFileSync(join(JOURNAL, name), body);

  // Commit any of these files that are new or uncommitted, so a commit that failed last run is retried.
  const paths = ['profile.md', 'ledger.md', 'teardowns.md'].filter((f) => existsSync(join(JOURNAL, f)));
  if (!read('git', ['-C', JOURNAL, 'status', '--porcelain', '--', ...paths])) {
    return console.log('✓ Journal files are up to date.');
  }
  if (!run('git', ['add', '--', ...paths], { cwd: JOURNAL }) ||
      !run('git', ['commit', '-q', '-m', 'Add learner profile and ledger', '--', ...paths], { cwd: JOURNAL })) {
    stop(`Could not commit ${paths.join(', ')} in ${JOURNAL}. Fix the git error above, then re-run setup.`);
  }
  const pushed = !read('git', ['-C', JOURNAL, 'remote', 'get-url', 'origin']) ||
    run('git', ['push', '-q', '-u', 'origin', 'HEAD'], { cwd: JOURNAL });
  console.log(pushed ? `✓ Saved ${paths.join(', ')}.` : '! Saved locally, but the push failed. The skill pushes again after the next teardown.');
}

console.log(`reverse-learn-kunal setup

This will, asking before each step:
  1. install the reverse-learn-kunal skill into your coding agents
  2. set up REA, the reverse-engineering tools the skill uses
  3. create your private learning journal repo in ${JOURNAL}, then ask your level
`);
if (!interactive) console.log('No terminal detected, so setup uses safe defaults: skill yes, REA skipped, a new private journal repo, level asked later.\n');

if (!ok('git', ['--version'])) stop('git is not installed. Install it from https://git-scm.com, then re-run setup.');
if (!read('git', ['config', 'user.email'])) {
  stop('git does not know who you are yet, and the journal needs that to save progress. Run:\n' +
       '  git config --global user.name "Your Name"\n  git config --global user.email "you@example.com"\nthen re-run setup.');
}

if (await yes('Install the skill into your coding agents? (you pick which agents next)', true)) {
  if (!run('npx', ['-y', 'skills', 'add', SOURCE, '-g', ...(interactive ? [] : ['-y'])])) {
    console.log(`! Skill install did not finish. You can retry later with: npx skills add ${SOURCE} -g`);
  }
}

if (await yes('Set up REA? It shows every change it will make and asks before applying.', interactive)) {
  if (!run('npx', ['-y', 'rea-agents@latest', 'setup'])) {
    console.log('! REA setup did not finish. You can retry later with: npx rea-agents@latest setup');
  }
} else {
  console.log('Skipped REA. The skill needs it for teardowns, so run this before your first one: npx rea-agents@latest setup');
}

await setupJournal();
await setupLedger();
rl?.close();

console.log(`
Done. Restart your coding agent, then try:

  run reverse-learn-kunal on <any product name>

On another device, run this setup again and choose option 2 to bring your journal along.`);
