import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sliceAst } from '../scripts/ast_slice.js';
test('AST_IFACE_INLINE', () => { const o = sliceAst('export interface User { id: string; }','ts'); assert.match(o.outline, /id:\s*string/); });
test('AST_FN_SIG', () => { const o = sliceAst('function foo(){ return 1; }','js'); assert.match(o.outline, /function foo/); assert.doesNotMatch(o.outline, /return 1/); });
test('AST_FN_INTERFACE_WORD', () => { const o = sliceAst('function foo(){ return "interface"; }','js'); assert.match(o.outline, /function foo/); assert.doesNotMatch(o.outline, /return/); });
test('AST_IFACE_MULTILINE', () => {
  const code = 'export interface User {\n id: string;\n name: number;\n}\nexport const x = 1;';
  const o = sliceAst(code, 'ts');
  assert.match(o.outline, /interface User/);
  assert.match(o.outline, /id:\s*string/);
  assert.match(o.outline, /name:\s*number/);
  assert.doesNotMatch(o.declarations[0], /export const x/);
  assert.match(o.outline, /export const x/);
});
test('AST_IFACE_UNTERMINATED_DIAGNOSTIC', () => {
  const code = 'export interface User {\n id: string;';
  const o = sliceAst(code, 'ts');
  assert.match(o.outline, /unterminated/);
});
