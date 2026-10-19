#!/usr/bin/env node
// One-time setup for product-teardowns. Everything lives in the user's own GitHub account:
// GitHub login, the skills, REA built from GitHub, a private journal repo, the learner profile,
// their own build-products-kunal (a fork, unless they own it) and their preferences.
// Run with: npx github:k4kd/product-teardowns
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { fileURLToPath } from 'node:url';

const SOURCE = 'k4kd/product-teardowns';
const STYLE_SOURCE = 'k4kd/write-a-prd-kunal';
const UPSTREAM = 'k4kd/build-products-kunal';
const HOME = homedir();
const BASE = join(HOME, '.product-teardowns');
const OLD_BASE = join(HOME, '.reverse-learn'); // before the rename
const CONFIG = join(BASE, 'config.json');
const JOURNAL = join(HOME, 'learning-journal');
const LEGACY_BUILD_PRODUCTS = join(HOME, 'Downloads', 'build-products-kunal'); // where the author already keeps it
const UPDATE_REA = join(dirname(fileURLToPath(import.meta.url)), '..', 'skills', 'product-teardowns-setup', 'scripts', 'update-rea.mjs');
const interactive = process.stdin.isTTY;
const rl = interactive ? createInterface({ input: process.stdin, output: process.stdout }) : null;
if (!interactive) process.env.GIT_TERMINAL_PROMPT = '0'; // never hang on a credential prompt

// npx and claude are .cmd shims on Windows, so they need a shell there; git and gh never do.
const winShell = (cmd) => process.platform === 'win32' && ['npx', 'claude'].includes(cmd);
const run = (cmd, args, opts = {}) => {
  rl?.pause(); // let the child own the terminal
  const r = spawnSync(cmd, args, { stdio: interactive ? 'inherit' : ['ignore', 'inherit', 'inherit'], shell: winShell(cmd), ...opts });
  rl?.resume();
  return r.status === 0;
};
const read = (cmd, args, opts = {}) => {
  const r = spawnSync(cmd, args, { encoding: 'utf8', ...opts });
  return r.status === 0 ? r.stdout.trim() : '';
};
const ok = (cmd, args) => spawnSync(cmd, args, { stdio: 'ignore', shell: winShell(cmd) }).status === 0;

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

if (!existsSync(BASE) && existsSync(OLD_BASE)) renameSync(OLD_BASE, BASE); // carry over a reverse-learn install
let config = {};
if (existsSync(CONFIG)) {
  try { config = JSON.parse(readFileSync(CONFIG, 'utf8')); } catch {
    copyFileSync(CONFIG, `${CONFIG}.bak`);
    console.log(`! ${CONFIG} was unreadable; saved a copy as config.json.bak and starting fresh.`);
  }
}
const saveConfig = () => { mkdirSync(BASE, { recursive: true }); writeFileSync(CONFIG, `${JSON.stringify(config, null, 2)}\n`); };

// --- GitHub: install gh if needed, log in, and let git push with gh's credentials.
async function ensureGitHub() {
  if (!ok('gh', ['--version'])) {
    if (interactive && process.platform === 'darwin' && ok('brew', ['--version']) && await yes('The GitHub CLI (gh) is needed. Install it with Homebrew now?', true)) {
      if (!run('brew', ['install', 'gh'])) stop('Homebrew could not install gh. Install it from https://cli.github.com, then re-run setup.');
    } else {
      stop('The GitHub CLI (gh) is needed. Install it from https://cli.github.com, then re-run setup.');
    }
  }
  if (!ok('gh', ['auth', 'status'])) {
    if (!interactive) stop('You are not logged in to GitHub. Run `gh auth login`, then re-run setup.');
    console.log('\nYou are not logged in to GitHub yet. Opening the GitHub login; setup continues when it finishes.');
    run('gh', ['auth', 'login']);
    if (!ok('gh', ['auth', 'status'])) stop('GitHub login did not finish. Run `gh auth login`, then re-run setup.');
  }
  run('gh', ['auth', 'setup-git'], { stdio: 'ignore' });
  const login = read('gh', ['api', 'user', '-q', '.login']);
  if (!login) stop('Could not read your GitHub username from gh. Check `gh auth status`, then re-run setup.');
  config.githubUser = login;
  console.log(`✓ Logged in to GitHub as ${login}.`);
}

// --- REA, built from the latest GitHub commit and kept up to date by the skill on every run.
async function setupRea() {
  if (!await yes('Install REA (the reverse-engineering tools) from its GitHub repo and keep it updated?', true)) {
    config.reaPath ??= '';
    return console.log('Skipped REA. The skill needs it for teardowns. Re-run setup, or run: npx rea-agents@latest setup');
  }
  console.log('Fetching and building REA from GitHub (about a minute)...');
  const r = spawnSync(process.execPath, [UPDATE_REA], { encoding: 'utf8' });
  let result = {};
  try { result = JSON.parse(r.stdout); } catch { /* reported below */ }
  if (!result.livePath) {
    config.reaPath = '';
    console.log(`! Could not build REA from GitHub (${result.detail || 'unknown error'}). Falling back to the npm release.`);
    if (!run('npx', ['-y', 'rea-agents@latest', 'setup'])) console.log('! REA setup did not finish. Retry later with: npx rea-agents@latest setup');
    return;
  }
  config.reaPath = result.livePath;
  console.log(`✓ REA ${result.version || ''} built at ${result.livePath}. Updates are logged in ${result.log}.`);
  const server = [process.execPath, join(result.livePath, 'scripts', 'rea.mjs'), 'mcp'];
  // Replacing an existing server is never done without a terminal to ask on.
  if (ok('claude', ['--version']) && await yes('Register this REA build as the "rea" MCP server in Claude Code (replacing any existing one)?', interactive)) {
    let previous = null; // restored if the new registration fails
    try { previous = JSON.parse(readFileSync(join(HOME, '.claude.json'), 'utf8')).mcpServers?.rea ?? null; } catch { /* none */ }
    spawnSync('claude', ['mcp', 'remove', 'rea', '-s', 'user'], { stdio: 'ignore', shell: winShell('claude') });
    if (run('claude', ['mcp', 'add', '-s', 'user', 'rea', '--', ...server])) {
      console.log('✓ Registered. Restart Claude Code to load it.');
    } else {
      if (previous) spawnSync('claude', ['mcp', 'add-json', '-s', 'user', 'rea', JSON.stringify(previous)], { stdio: 'ignore', shell: winShell('claude') });
      console.log(`! Could not register the new REA build${previous ? '; your previous "rea" server was restored' : ''}.`);
    }
  } else {
    console.log(`For other agents, register an MCP server named "rea" that runs: ${server.join(' ')}`);
  }
}

// --- Journal: a private repo in the user's own GitHub.
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
    const url = await ask(`Journal repo URL [https://github.com/${config.githubUser}/learning-journal.git]:`, `https://github.com/${config.githubUser}/learning-journal.git`);
    if (!/^(https:\/\/|git@)\S+$/.test(url)) stop('That does not look like a git URL. Re-run setup to try again.');
    if (!run('git', ['clone', url, JOURNAL])) stop('Clone failed. Check the URL and your GitHub access, then re-run setup.');
    console.log(`✓ Journal cloned to ${JOURNAL}.`);
    return;
  }

  mkdirSync(join(JOURNAL, 'teardowns'), { recursive: true });
  writeFileSync(join(JOURNAL, 'README.md'),
    '# Learning journal\n\nWritten by the product-teardowns skill: profile.md (levels), ledger.md (concepts learnt), teardowns.md (index) and teardowns/ (the docs).\n');
  if (!run('git', ['init', '-q', '-b', 'main'], { cwd: JOURNAL }) ||
      !run('git', ['add', '-A'], { cwd: JOURNAL }) ||
      !run('git', ['commit', '-q', '-m', 'Start learning journal'], { cwd: JOURNAL })) {
    stop(`Could not create the journal's first commit in ${JOURNAL}.`);
  }
  await createRepo();
}

async function createRepo() {
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
  const today = new Date().toLocaleDateString('en-CA'); // local YYYY-MM-DD, same as publish
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

// --- build-products-kunal: the owner keeps the original; everyone else gets their own fork.
async function setupBuildProducts() {
  config.buildProductsUpstream = UPSTREAM;
  const owner = UPSTREAM.split('/')[0];
  const isOwner = config.githubUser === owner;
  const existing = [config.buildProductsPath, isOwner && LEGACY_BUILD_PRODUCTS, join(BASE, 'build-products-kunal')]
    .find((p) => p && existsSync(join(p, '.git')));
  if (existing) {
    config.buildProductsPath = existing;
    console.log(`✓ build-products-kunal is at ${existing}.`);
  } else {
    const target = join(BASE, 'build-products-kunal');
    mkdirSync(BASE, { recursive: true });
    if (existsSync(target)) stop(`${target} exists but is not a git repo. Move it aside, then re-run setup.`);
    console.log(isOwner
      ? `Cloning ${UPSTREAM}: every teardown adds lessons to it.`
      : `Forking ${UPSTREAM} into your GitHub account: every teardown adds lessons to your copy.`);
    const done = isOwner
      ? run('git', ['clone', '-q', `https://github.com/${UPSTREAM}.git`, target])
      : run('gh', ['repo', 'fork', UPSTREAM, '--clone', '--remote'], { cwd: BASE });
    if (!done || !existsSync(join(target, '.git'))) {
      console.log('! Could not set up build-products-kunal. Re-run setup to try again.');
      return;
    }
    config.buildProductsPath = target;
    console.log(`✓ build-products-kunal is at ${target}.`);
  }
  if (isOwner) {
    config.shareLessons = false;
  } else if (interactive || config.shareLessons === undefined) {
    config.shareLessons = await yes(`Share your teardown lessons with the author? Each teardown then opens a pull request to ${UPSTREAM}.`, config.shareLessons ?? false);
  }
}

// --- What happens to each product's code and findings on this computer.
async function setupRetention() {
  if (!interactive) {
    config.keepTeardowns ??= 'permanent';
    return;
  }
  console.log(`\nEach teardown downloads the product's code and writes findings to ~/teardowns/<product>/.
  1. Keep them permanently (lets you re-run one stage on that product later)
  2. Delete them after the doc is pushed (saves disk space; the doc stays in your journal)
  3. Ask me at the end of each teardown`);
  const current = { permanent: '1', temporary: '2', ask: '3' }[config.keepTeardowns] ?? '1';
  const choice = await ask(`Choose 1, 2 or 3 [${current}]:`, current);
  config.keepTeardowns = { 1: 'permanent', 2: 'temporary', 3: 'ask' }[choice] ?? config.keepTeardowns ?? 'permanent';
  console.log(`✓ Teardown files: ${config.keepTeardowns}.`);
}

console.log(`product-teardowns setup

Everything is set up in your own GitHub account. Asking before each step, this will:
  1. log you in to GitHub (installing the GitHub CLI if needed) and let git use that login
  2. install the product-teardowns skills, plus write-a-prd-kunal for the writing style
  3. build REA, the reverse-engineering tools, from its GitHub repo
  4. create your private learning journal repo in ${JOURNAL}, then ask your level
  5. set up your copy of build-products-kunal, which every teardown adds lessons to
  6. ask whether to keep each product's downloaded code and findings
`);
if (!interactive) console.log('No terminal detected, so setup uses safe defaults where it can.\n');

if (!ok('git', ['--version'])) stop('git is not installed. Install it from https://git-scm.com, then re-run setup.');
if (!read('git', ['config', 'user.email'])) {
  stop('git does not know who you are yet, and the journal needs that to save progress. Run:\n' +
       '  git config --global user.name "Your Name"\n  git config --global user.email "you@example.com"\nthen re-run setup.');
}

await ensureGitHub();
saveConfig();

if (await yes('Install the skills into your coding agents? (you pick which agents next)', true)) {
  for (const source of [SOURCE, STYLE_SOURCE]) {
    if (!run('npx', ['-y', 'skills', 'add', source, '-g', ...(interactive ? [] : ['-y'])])) {
      console.log(`! Skill install did not finish. You can retry later with: npx skills add ${source} -g`);
    }
  }
}

await setupRea();
saveConfig();
await setupJournal();
await setupLedger();
await setupBuildProducts();
saveConfig();
await setupRetention();
saveConfig();
rl?.close();

console.log(`
✓ Settings saved in ${CONFIG}. Re-run this setup any time to change them.

Done. Restart your coding agent, then try:

  run product-teardowns on <any product name>

On another device, run this setup again and choose option 2 to bring your journal along.`);
