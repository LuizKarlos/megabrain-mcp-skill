import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-pipeline/SKILL.md'), 'utf8');
const heal = readFileSync(join(root, 'megabrain-pipeline/references/auto-healing-patterns.md'), 'utf8');
const dag = readFileSync(join(root, 'megabrain-pipeline/references/dag-decomposition-rules.md'), 'utf8');
const waves = readFileSync(join(root, 'megabrain-pipeline/references/topological-waves.md'), 'utf8');
const docs = skill + heal + dag + waves;

function extractCalls(markdown) {
  const blocks = [...markdown.matchAll(/```bash\n([\s\S]*?)```/g)];
  const calls = [];
  for (const b of blocks) {
    for (const m of b[1].matchAll(/megabrain\s+call\s+([\w.]+)\s+'([^']+)'/g)) {
      const parsed = JSON.parse(m[2]);
      assert.equal(typeof parsed, 'object');
      assert.notEqual(parsed, null);
      assert.equal(Array.isArray(parsed), false);
      calls.push({ tool: m[1], json: parsed });
    }
  }
  return calls;
}
const calls = Object.fromEntries(extractCalls(skill).map(c => [c.tool, c.json]));

test('DOCS_PIPE_CONTRACT', () => {
  assert.match(skill, /megabrain\.decompose/);
  assert.match(skill, /prompt/);
  assert.match(skill, /test_commands/);
  assert.doesNotMatch(skill, /max_depth/);
  assert.doesNotMatch(skill, /wave_index/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
  assert.ok(calls['megabrain.decompose']?.prompt);
  assert.ok(calls['megabrain.execute_pipeline']?.test_commands);
  for (const c of extractCalls(skill)) {
    assert.ok(!('max_depth' in c.json) && !('wave_index' in c.json) && !('canary' in c.json));
  }
});

test('DOCS_PIPE_HEAL', () => {
  assert.match(skill, /megabrain\.heal_dependency_graph/);
  assert.doesNotMatch(skill, /canary/);
  assert.match(docs, /NOT_EXECUTED/);
  assert.match(skill, /BLOCKED/);
  const h = calls['megabrain.heal_dependency_graph'];
  assert.ok(h.tasks && h.completed_task_ids && h.failed_task_ids && h.capability_catalog);
  assert.equal('canary' in h, false);
  assert.equal('work_id' in h, false);
  assert.ok(Array.isArray(h.tasks[0].dependencies));
  const s = calls['megabrain.synthesize_subtask'];
  assert.ok(s.work_id && s.parent_task_id && s.new_task && Array.isArray(s.new_task.dependencies));
});

test('DOCS_PIPE_QUALIFIED', () => {
  assert.match(skill, /megabrain\.execute_pipeline/);
  assert.match(skill, /megabrain\.get_parallel_waves/);
  assert.match(dag, /megabrain\.decompose/);
  assert.match(waves, /test_commands/);
  assert.match(heal, /synthesize_subtask/);
  assert.ok(calls['megabrain.execute_pipeline'] && calls['megabrain.get_parallel_waves']);
});
