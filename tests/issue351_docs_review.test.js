import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-review/SKILL.md'), 'utf8');
const slop = readFileSync(join(root, 'megabrain-review/references/anti-slop-patterns.md'), 'utf8');
const dual = readFileSync(join(root, 'megabrain-review/references/dual-blind-adjudication.md'), 'utf8');
const voice = readFileSync(join(root, 'megabrain-review/references/voice-calibration.md'), 'utf8');
const docs = skill + slop + dual + voice;

test('DOCS_REV_APPROVED', () => {
  assert.match(skill, /megabrain\.adjudicate_consensus/);
  assert.match(skill, /approved/);
  assert.match(docs, /não é autorização/);
  assert.match(docs, /advisory/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_REV_NO_ARBITER', () => {
  assert.match(skill, /Jev é só advisory/);
  assert.match(dual, /nenhum árbitro LLM server-side/);
  assert.doesNotMatch(skill, /third-party arbiter/);
});

test('DOCS_REV_JSON', () => {
  assert.match(skill, /megabrain\.anti_slop_lint/);
  assert.match(skill, /megabrain\.voice_calibrate/);
  assert.match(slop, /JSON objeto/);
  assert.match(voice, /JSON objeto/);
  assert.doesNotMatch(slop, /call anti_slop_lint --text/);
});
test('DOCS_REV_CALLS_AND_AST', () => {
  const calls = [...skill.matchAll(/megabrain call (\S+) '([^']+)'/g)].map(m => ({ tool: m[1], json: JSON.parse(m[2]) }));
  assert.ok(calls.length >= 4);
  for (const c of calls) assert.equal(typeof c.json, 'object');
  const adj = calls.find(c => c.tool === 'megabrain.adjudicate_consensus')?.json;
  assert.ok(adj && adj.task_id && Array.isArray(adj.reviews) && adj.reviews.length > 0);
  const r0 = adj.reviews[0];
  for (const req of ['reviewer', 'approved', 'score', 'verdict', 'notes', 'rationale']) {
    assert.ok(req in r0, `reviews[0] missing ${req}`);
  }
  for (const t of ['megabrain.anti_slop_lint', 'megabrain.voice_calibrate', 'megabrain.readability_score']) {
    assert.ok(calls.find(c => c.tool === t)?.json.text);
  }
  assert.ok(calls.find(c => c.tool === 'megabrain.voice_calibrate')?.json.author_sample);
  const kPath = process.env.MEGABRAIN_KERNEL_SOURCE || '/srv/megabrain-dev/repository/runtime/mcp_server.py';
  const sigs = existsSync(kPath)
    ? JSON.parse(execSync('python3 - <<PY\nimport ast, json\ntree = ast.parse(open("' + kPath + '").read())\nprint(json.dumps({n.name: [a.arg for a in n.args.args] for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}))\nPY', { encoding: 'utf8' }))
    : { adjudicate_consensus_tool: ['task_id', 'reviews', 'work_id'] };
  assert.ok(Object.keys(adj).every(k => sigs.adjudicate_consensus_tool.includes(k)));
});
