import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-orchestrate/SKILL.md'), 'utf8');
const life = readFileSync(join(root, 'megabrain-orchestrate/references/mission-lifecycle.md'), 'utf8');
const swarm = readFileSync(join(root, 'megabrain-orchestrate/references/swarm-coordination.md'), 'utf8');
const docs = skill + life + swarm;

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

test('DOCS_ORCH_CONTRACT', () => {
  assert.match(skill, /megabrain\.orchestrate/);
  assert.match(skill, /prompt/);
  assert.match(skill, /idempotency_key/);
  assert.match(skill, /workspace_root/);
  assert.match(skill, /finalize_mode/);
  assert.doesNotMatch(skill, /budget_tokens/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
  const orch = calls['megabrain.orchestrate'];
  assert.ok(orch && orch.prompt && orch.idempotency_key && orch.workspace_root && orch.finalize_mode);
  for (const c of extractCalls(skill)) {
    assert.ok(!('budget_tokens' in c.json) && !('max_concurrency' in c.json));
  }
});

test('DOCS_SWARM_BLOCKED', () => {
  assert.match(skill, /megabrain\.coordinate_mission_swarm/);
  assert.match(docs, /INSUFFICIENT_EVIDENCE/);
  assert.match(docs, /NOT_EXECUTED/);
  assert.doesNotMatch(skill, /max_concurrency/);
  const swarmCall = calls['megabrain.coordinate_mission_swarm'];
  assert.ok(swarmCall && swarmCall.mission && swarmCall.evidence_bundle);
});

test('DOCS_QUALIFIED_NAMES', () => {
  assert.match(skill, /megabrain\.create_checkpoint/);
  assert.match(skill, /megabrain\.rollback_checkpoint/);
  assert.match(life, /MISSION_NOT_FOUND/);
  assert.match(swarm, /agent_id/);
  assert.ok(calls['megabrain.create_checkpoint']?.work_id);
  assert.ok(calls['megabrain.rollback_checkpoint']?.work_id && calls['megabrain.rollback_checkpoint']?.checkpoint_id);
});
