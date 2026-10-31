import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeBlockHash, verifyLedger } from '../scripts/merkle_verify.js';

function mk(index, prev, data = 'x') {
  const b = { index, previous_hash: prev, data };
  b.hash = computeBlockHash(b);
  return b;
}

test('GENESIS_F64_INVALID', () => {
  assert.equal(verifyLedger([mk(0, 'f'.repeat(64))]).valid, false);
});

test('GENESIS_INDEX42_INVALID', () => {
  assert.equal(verifyLedger([mk(42, '0')]).valid, false);
});

test('GENESIS_ZERO_OK', () => {
  assert.equal(verifyLedger([mk(0, '0'.repeat(64))]).valid, true);
});

test('GENESIS_MISSING_INDEX_INVALID', () => { const b={previous_hash:'0', data:'x'}; b.hash=computeBlockHash(b); assert.equal(verifyLedger([b]).valid, false); });

test('INDEX_STRING_COERCION_INVALID', () => {
  const g = mk(0, '0'.repeat(64));
  assert.equal(verifyLedger([g, mk('1', g.hash)]).valid, false);
});

test('INDEX_NULL_INVALID', () => {
  const g = mk(0, '0'.repeat(64));
  assert.equal(verifyLedger([mk(null, '0'.repeat(64))]).valid, false);
  assert.equal(verifyLedger([g, mk(null, g.hash)]).valid, false);
});

test('INDEX_FLOAT_INVALID', () => {
  const g = mk(0, '0'.repeat(64));
  assert.equal(verifyLedger([g, mk(1.5, g.hash)]).valid, false);
});

test('INDEX_UNSAFE_INTEGER_INVALID', () => {
  const g = mk(0, '0'.repeat(64));
  assert.equal(verifyLedger([g, mk(Number.MAX_SAFE_INTEGER + 1, g.hash)]).valid, false);
});

test('INDEX_VALID_SEQUENCE_OK', () => {
  const g = mk(0, '0'.repeat(64));
  assert.equal(verifyLedger([g, mk(1, g.hash)]).valid, true);
});
