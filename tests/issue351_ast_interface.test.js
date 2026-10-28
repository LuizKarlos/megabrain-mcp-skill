import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sliceAst } from '../scripts/ast_slice.js';
test('AST_IFACE_INLINE', () => { const o = sliceAst('export interface User { id: string; }','ts'); assert.match(o.outline, /id:\s*string/); });
test('AST_FN_SIG', () => { const o = sliceAst('function foo(){ return 1; }','js'); assert.match(o.outline, /function foo/); assert.doesNotMatch(o.outline, /return 1/); });
test('AST_FN_INTERFACE_WORD', () => { const o = sliceAst('function foo(){ return "interface"; }','js'); assert.match(o.outline, /function foo/); assert.doesNotMatch(o.outline, /return/); });
