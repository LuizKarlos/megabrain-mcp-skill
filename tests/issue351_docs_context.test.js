import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-context/SKILL.md'), 'utf8');
const ast = readFileSync(join(root, 'megabrain-context/references/ast-virtualization.md'), 'utf8');
const openapi = readFileSync(join(root, 'megabrain-context/references/openapi-contract-synthesis.md'), 'utf8');
const docs = skill + ast + openapi;

test('DOCS_CTX_OUTLINE', () => {
  assert.match(docs, /outline local limitado/);
  assert.match(skill, /AST Python no servidor/);
  assert.match(docs, /preserva/);
  assert.doesNotMatch(skill, /ast_slice\.js[^\n]*--json/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_CTX_NAMES', () => {
  assert.match(skill, /megabrain\.slice_ast_context/);
  assert.match(skill, /megabrain\.dispatch_subtask/);
  assert.match(skill, /megabrain\.synthesize_backend_contract/);
  assert.match(skill, /allowed_scope/);
});

test('DOCS_CTX_NO_PROMISE', () => {
  assert.match(docs, /sem medir/);
  assert.match(ast, /megabrain\.slice_ast_context/);
  assert.match(openapi, /JSON objeto/);
  assert.doesNotMatch(openapi, /call synthesize_backend_contract --operation_id/);
  assert.doesNotMatch(skill, /<3k/);
  assert.match(skill, /Sintaxes exercitadas/);
  const calls = [...skill.matchAll(/megabrain call (\S+) '([^']+)'/g)].map(m => ({ tool: m[1], json: JSON.parse(m[2]) }));
  assert.ok(calls.length >= 3);
  for (const c of calls) {
    assert.equal(typeof c.json, 'object');
    assert.notEqual(c.json, null);
  }
});
