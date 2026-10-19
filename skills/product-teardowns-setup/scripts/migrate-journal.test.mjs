// Self-check for migrate-journal.mjs: node migrate-journal.test.mjs
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'pt-migrate-'));
const J = join(dir, 'journal');
const env = { ...process.env, PRODUCT_TEARDOWNS_JOURNAL: J, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };
const sh = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: 'utf8', env });
sh('git', ['init', '-q', '--bare', join(dir, 'remote.git')]);
sh('git', ['clone', '-q', join(dir, 'remote.git'), J]);
mkdirSync(join(J, 'teardowns'));
writeFileSync(join(J, 'teardowns', '2026-10-19-x.md'), '# x\n');
writeFileSync(join(J, 'ledger.md'), '# Ledger\n\n| Concept | Area | Learnt from | Date | Doc |\n|---|---|---|---|---|\n| A | Code | x | 2026-10-19 | [doc](teardowns/2026-10-19-x.md) |\n');
writeFileSync(join(J, 'teardowns.md'), '# Teardowns\n\n- x · [doc](teardowns/2026-10-19-x.md)\n');
writeFileSync(join(J, 'profile.md'), '# Learner Profile\n\n## Levels\nSystems/infra: Beginner\n');
sh('git', ['add', '-A'], J); sh('git', ['commit', '-qm', 'v3'], J); sh('git', ['push', '-q', '-u', 'origin', 'HEAD'], J);

const script = new URL('./migrate-journal.mjs', import.meta.url).pathname;
let r = sh('node', [script]);
assert.equal(r.status, 0, r.stderr);
let out = JSON.parse(r.stdout);
assert.equal(out.status, 'migrated');
assert.equal(out.pushed, 'yes');
assert.ok(existsSync(join(J, 'technical', 'teardowns', '2026-10-19-x.md')), 'docs moved');
assert.ok(!existsSync(join(J, 'ledger.md')), 'flat ledger gone');
assert.match(readFileSync(join(J, 'technical', 'ledger.md'), 'utf8'), /^# Ledger \(technical\)\n[\s\S]*\(teardowns\/2026-10-19-x\.md\)/, 'retitled; link still relative and valid');
assert.match(readFileSync(join(J, 'profile.md'), 'utf8'), /^## Technical levels$/m);
assert.match(sh('git', ['log', '--stat', '-1', '--format=%s'], join(dir, 'remote.git')).stdout, /per-mode layout/, 'pushed');

r = sh('node', [script]);
assert.equal(JSON.parse(r.stdout).status, 'already-migrated', 'second run does nothing');
console.log('migrate-journal.mjs self-check passed');
