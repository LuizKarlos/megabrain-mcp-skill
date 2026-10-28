import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeBlockHash, verifyLedger } from '../scripts/merkle_verify.js';

test('ENV_ROOT_SIG_INVALID', () => {
  const b = { index: 0, previous_hash: '0', data: 'x' };
  b.hash = computeBlockHash(b);
  const r = verifyLedger({ blocks: [b], merkle_root: 'invalid', signature: 'invalid' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => /unsupported/i.test(e)));
});

test('ENV_LINEAR_OK', () => {
  const b = { index: 0, previous_hash: '0', data: 'x' };
  b.hash = computeBlockHash(b);
  assert.equal(verifyLedger([b]).valid, true);
});
