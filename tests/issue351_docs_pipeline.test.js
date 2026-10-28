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

test('DOCS_PIPE_CONTRACT', () => {
  assert.match(skill, /megabrain\.decompose/);
  assert.match(skill, /prompt/);
  assert.match(skill, /test_commands/);
  assert.doesNotMatch(skill, /max_depth/);
  assert.doesNotMatch(skill, /wave_index/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_PIPE_HEAL', () => {
  assert.match(skill, /megabrain\.heal_dependency_graph/);
  assert.match(docs, /canary/);
  assert.match(docs, /NOT_EXECUTED/);
  assert.match(skill, /BLOCKED/);
});

test('DOCS_PIPE_QUALIFIED', () => {
  assert.match(skill, /megabrain\.execute_pipeline/);
  assert.match(skill, /megabrain\.get_parallel_waves/);
  assert.match(dag, /megabrain\.decompose/);
  assert.match(waves, /test_commands/);
  assert.match(heal, /synthesize_subtask/);
});
