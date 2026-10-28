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

test('DOCS_ORCH_CONTRACT', () => {
  assert.match(skill, /megabrain\.orchestrate/);
  assert.match(skill, /prompt/);
  assert.match(skill, /idempotency_key/);
  assert.match(skill, /workspace_root/);
  assert.match(skill, /finalize_mode/);
  assert.doesNotMatch(skill, /budget_tokens/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_SWARM_BLOCKED', () => {
  assert.match(skill, /megabrain\.coordinate_mission_swarm/);
  assert.match(docs, /INSUFFICIENT_EVIDENCE/);
  assert.match(docs, /NOT_EXECUTED/);
  assert.doesNotMatch(skill, /max_concurrency/);
});

test('DOCS_QUALIFIED_NAMES', () => {
  assert.match(skill, /megabrain\.create_checkpoint/);
  assert.match(skill, /megabrain\.rollback_checkpoint/);
  assert.match(life, /MISSION_NOT_FOUND/);
  assert.match(swarm, /agent_id/);
});
