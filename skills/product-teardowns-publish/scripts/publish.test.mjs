// Self-check for publish.mjs: node publish.test.mjs
// Builds a throwaway journal with a bare remote, publishes twice, and checks rows, levels and the push.
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'pt-publish-'));
const sh = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', env: { ...process.env, PRODUCT_TEARDOWNS_JOURNAL: join(dir, 'journal'), GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' } });
  return r;
};
sh('git', ['init', '-q', '--bare', join(dir, 'remote.git')]);
sh('git', ['clone', '-q', join(dir, 'remote.git'), join(dir, 'journal')]);
const J = join(dir, 'journal');
writeFileSync(join(J, 'profile.md'), '# Learner Profile\n\n## Levels\nSystems/infra: Beginner\nAlgorithms: Beginner\nCode: Intermediate\n\n## Level history\n- start\n');
writeFileSync(join(J, 'ledger.md'), '# Ledger\n\n| Concept | Area | Learnt from | Date | Doc |\n|---|---|---|---|---|\n| Hashing | Algorithms | old | 2026-01-01 | x |\n');
writeFileSync(join(J, 'teardowns.md'), '# Teardowns\n\n');

const run = join(dir, 'run');
mkdirSync(run);
writeFileSync(join(run, 'doc.md'), '# Doc\n\n## Sources\n- Readability: pending\n');
writeFileSync(join(run, 'readability-1.md'), '- Verdict: FAIL\n- Score: 6   Answers correct: 7/10\n');
writeFileSync(join(run, 'readability-2.md'), '- Verdict: PASS\n- Score: 8   Answers correct: 10/10\n');
const concepts = ['hashing', 'Queues', 'Heaps', 'Tries', 'Bloom | filters'].map((name) => ({ name, area: 'Algorithms' }));
concepts.push({ name: 'Ropes', area: 'Code' });
writeFileSync(join(run, 'publish.json'), JSON.stringify({ slug: '2026-10-19-demo', target: 'demo', version: '1.0.0', lesson: 'small is fine', newConcepts: concepts }));

const script = new URL('./publish.mjs', import.meta.url).pathname;
const first = sh('node', [script, '--run', run]);
assert.equal(first.status, 0, first.stderr);
const out = JSON.parse(first.stdout);
assert.deepEqual(out.added, ['Queues', 'Heaps', 'Tries', 'Bloom | filters', 'Ropes'], 'hashing is already known (case-insensitive)');
assert.equal(out.pushed, 'yes');

const ledger = readFileSync(join(J, 'ledger.md'), 'utf8');
assert.match(ledger, /\| Bloom \/ filters \| Algorithms \| demo 1\.0\.0 \|/, 'pipes in names are escaped');
const profile = readFileSync(join(J, 'profile.md'), 'utf8');
assert.match(profile, /^Algorithms: Intermediate$/m, '5 algorithm concepts → Intermediate');
assert.match(profile, /^Code: Intermediate$/m, 'a level never drops');
assert.match(profile, /Algorithms Beginner → Intermediate \(5 concepts/);
assert.match(readFileSync(join(J, 'teardowns/2026-10-19-demo.md'), 'utf8'), /Readability: PASS on run 2 .* score 8\/10, 10\/10 answers correct/);
assert.match(sh('git', ['log', '--oneline'], join(dir, 'remote.git')).stdout, /demo: Queues/, 'pushed to the remote');

// Re-running must not duplicate anything.
const second = sh('node', [script, '--run', run]);
assert.equal(second.status, 0, second.stderr);
assert.deepEqual(JSON.parse(second.stdout).added, []);
assert.equal(readFileSync(join(J, 'ledger.md'), 'utf8'), ledger);
assert.equal(readFileSync(join(J, 'teardowns.md'), 'utf8').match(/2026-10-19-demo/g).length, 1);

// Bad input is refused.
writeFileSync(join(run, 'publish.json'), JSON.stringify({ slug: 'bad', target: 'x', newConcepts: [] }));
assert.notEqual(sh('node', [script, '--run', run]).status, 0);

console.log('publish.mjs self-check passed');
