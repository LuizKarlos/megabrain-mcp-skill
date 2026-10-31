import './issue351_ast_interface.test.js';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sliceAst } from '../scripts/ast_slice.js';

test('AST_FN_DESTRUCTURED_TYPE_RETURN_PRESERVED', () => {
  const code = 'export function foo({name}:{name:string}):string { return name; }';
  const o = sliceAst(code, 'ts');
  assert.equal(o.declarations[0], 'export function foo({name}:{name:string}):string');
  assert.doesNotMatch(o.outline, /return/);
});

test('AST_FN_DESTRUCTURED_MULTILINE_PRESERVED', () => {
  const code = `export function foo(
  { name }: { name: string }
): string {
  return name;
}`;
  const o = sliceAst(code, 'ts');
  assert.match(o.declarations[0], /export function foo/);
  assert.match(o.declarations[0], /name:\s*string/);
  assert.match(o.declarations[0], /:\s*string/);
  assert.doesNotMatch(o.outline, /return/);
});

test('AST_FN_TWO_FUNCTIONS_NOT_MERGED', () => {
  const code = `export function foo({name}:{name:string}):string { return name; }
export function bar({id}:{id:number}):number { return id; }`;
  const o = sliceAst(code, 'ts');
  assert.equal(o.declarations.length, 2);
  assert.equal(o.declarations[0], 'export function foo({name}:{name:string}):string');
  assert.equal(o.declarations[1], 'export function bar({id}:{id:number}):number');
  assert.doesNotMatch(o.outline, /return/);
});
