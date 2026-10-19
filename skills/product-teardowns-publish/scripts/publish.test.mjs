// Self-check for publish.mjs: node publish.test.mjs
// Builds a throwaway journal with a bare remote, publishes technical, product and design runs, and checks rows, levels and the push.
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'pt-publish-'));
const env = { ...process.env, PRODUCT_TEARDOWNS_JOURNAL: join(dir, 'journal'), GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const sh = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: 'utf8', env });
sh('git', ['init', '-q', '--bare', join(dir, 'remote.git')]);
sh('git', ['clone', '-q', join(dir, 'remote.git'), join(dir, 'journal')]);
const J = join(dir, 'journal');
writeFileSync(join(J, 'profile.md'), '# Learner Profile\n\n## Technical levels\nSystems/infra: Beginner\nAlgorithms: Beginner\nCode: Intermediate\n\n## Product levels\nProduct sense: Beginner\nGrowth: Beginner\nBusiness: Beginner\nData: Beginner\n\n## Level history\n- start\n');
mkdirSync(join(J, 'technical'));
writeFileSync(join(J, 'technical', 'ledger.md'), '# Ledger (technical)\n\n| Concept | Area | Learnt from | Date | Doc |\n|---|---|---|---|---|\n| Hashing | Algorithms | old | 2026-01-01 | x |\n');

const makeRun = (name, meta, readability = {}) => {
  const run = join(dir, 'run', name);
  mkdirSync(run, { recursive: true });
  writeFileSync(join(run, 'doc.md'), `# ${name} doc\n\n## Sources\n- Readability: pending\n`);
  for (const [file, body] of Object.entries(readability)) writeFileSync(join(run, file), body);
  writeFileSync(join(run, 'publish.json'), JSON.stringify(meta));
  return run;
};
const script = new URL('./publish.mjs', import.meta.url).pathname;
const publish = (run) => sh('node', [script, '--run', run]);

// --- technical
const concepts = ['hashing', 'Queues', 'Heaps', 'Tries', 'Bloom | filters'].map((name) => ({ name, area: 'Algorithms' }));
concepts.push({ name: 'Ropes', area: 'Code' });
const tech = makeRun('technical', { mode: 'technical', slug: '2026-10-19-demo', target: 'demo', version: '1.0.0', lesson: 'small is fine', newConcepts: concepts },
  { 'readability-1.md': '- Verdict: FAIL\n- Score: 6   Answers correct: 7/10\n', 'readability-2.md': '- Verdict: PASS\n- Score: 8   Answers correct: 10/10\n' });
let r = publish(tech);
assert.equal(r.status, 0, r.stderr);
let out = JSON.parse(r.stdout);
assert.equal(out.mode, 'technical');
assert.deepEqual(out.added, ['Queues', 'Heaps', 'Tries', 'Bloom | filters', 'Ropes'], 'hashing is already known (case-insensitive)');
assert.equal(out.pushed, 'yes');
const ledger = readFileSync(join(J, 'technical', 'ledger.md'), 'utf8');
assert.match(ledger, /\| Bloom \/ filters \| Algorithms \| demo 1\.0\.0 \| .* \| \[doc\]\(teardowns\/2026-10-19-demo\.md\) \|/, 'pipes escaped, link relative to the mode folder');
let profile = readFileSync(join(J, 'profile.md'), 'utf8');
assert.match(profile, /^Algorithms: Intermediate$/m, '5 algorithm concepts → Intermediate');
assert.match(profile, /^Code: Intermediate$/m, 'a level never drops');
assert.match(readFileSync(join(J, 'technical', 'teardowns', '2026-10-19-demo.md'), 'utf8'), /Readability: PASS on run 2 .* score 8\/10, 10\/10 answers correct/);
assert.match(sh('git', ['log', '--oneline'], join(dir, 'remote.git')).stdout, /demo \(technical\): Queues/, 'pushed to the remote');

// Re-running must not duplicate anything.
r = publish(tech);
assert.equal(r.status, 0, r.stderr);
assert.deepEqual(JSON.parse(r.stdout).added, []);
assert.equal(readFileSync(join(J, 'technical', 'ledger.md'), 'utf8'), ledger);
assert.equal(readFileSync(join(J, 'technical', 'teardowns.md'), 'utf8').match(/2026-10-19-demo/g).length, 1);

// --- product: its own folder, ledger (created on first publish) and levels
const pm = ['Freemium', 'Activation', 'Aha moment', 'Habit loops', 'Referral loops'].map((name) => ({ name, area: 'Growth' }));
pm.push({ name: 'Hashing', area: 'Business' }); // same name as a technical concept: separate ledgers, so it is new here
const prod = makeRun('product', { mode: 'product', slug: '2026-10-19-demo', target: 'demo', version: '1.0.0', lesson: 'free tier as the loop', newConcepts: pm });
r = publish(prod);
assert.equal(r.status, 0, r.stderr);
out = JSON.parse(r.stdout);
assert.equal(out.mode, 'product');
assert.equal(out.added.length, 6);
assert.match(readFileSync(join(J, 'product', 'ledger.md'), 'utf8'), /^# Ledger \(product\)/);
assert.ok(existsSync(join(J, 'product', 'teardowns', '2026-10-19-demo.md')));
profile = readFileSync(join(J, 'profile.md'), 'utf8');
assert.match(profile, /^Growth: Intermediate$/m, 'product levels rise from the product ledger');
assert.match(profile, /^Algorithms: Intermediate$/m, 'technical levels untouched');
assert.match(readFileSync(join(J, '.gitattributes'), 'utf8'), /\*\*\/ledger\.md merge=union/);

// --- design: no levels section yet, so publishing still works and levels are left for setup to ask
const design = makeRun('design', { mode: 'design', slug: '2026-10-19-demo', target: 'demo', newConcepts: [{ name: 'Fitts law', area: 'Interaction & UX' }] });
mkdirSync(join(dir, 'run', 'findings', 'screens'), { recursive: true });
writeFileSync(join(dir, 'run', 'findings', 'screens', 'checkout.png'), 'PNG');
writeFileSync(join(dir, 'secret.png'), 'SECRET');
spawnSync('ln', ['-s', join(dir, 'secret.png'), join(dir, 'run', 'findings', 'screens', 'sneaky.png')]); // a link pointing outside the run
writeFileSync(join(design, 'doc.md'), '# d\n\n![The checkout](../findings/screens/checkout.png)\n![remote](https://x.test/a.png)\n![escape](/etc/hosts)\n![escape2](../../../../etc/passwd.png)\n![sneaky](../findings/screens/sneaky.png)\n![again](../findings/screens/checkout.png)\n\n- Readability: pending\n');
r = publish(design);
assert.equal(r.status, 0, r.stderr);
out = JSON.parse(r.stdout);
assert.deepEqual(out.raised, []);
assert.equal(out.assets, 1, 'one copy of the screenshot; remote, out-of-run and symlinked-out paths left alone');
const ddoc = readFileSync(join(J, 'design', 'teardowns', '2026-10-19-demo.md'), 'utf8');
assert.match(ddoc, /!\[The checkout\]\(2026-10-19-demo-assets\/01-checkout\.png\)/);
assert.match(ddoc, /https:\/\/x\.test\/a\.png/);
assert.ok(existsSync(join(J, 'design', 'teardowns', '2026-10-19-demo-assets', '01-checkout.png')));
assert.match(sh('git', ['show', '--stat', '--format=', 'HEAD'], J).stdout, /01-checkout\.png/, 'screenshot committed');

// Bad input is refused.
assert.notEqual(publish(makeRun('bad1', { slug: 'bad', target: 'x', newConcepts: [] })).status, 0);
assert.notEqual(publish(makeRun('bad2', { mode: 'marketing', slug: '2026-10-19-x', target: 'x', newConcepts: [] })).status, 0);
assert.notEqual(publish(makeRun('bad3', { mode: 'product', slug: '2026-10-19-x', target: 'x', newConcepts: [{ name: 'X', area: 'Algorithms' }] })).status, 0, 'an area from another mode is refused');

console.log('publish.mjs self-check passed');
