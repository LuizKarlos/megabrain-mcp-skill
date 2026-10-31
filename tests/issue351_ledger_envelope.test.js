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
test('ENV_ALLOWLIST_WRAPPER', () => {
  const b = { index: 0, previous_hash: '0', data: 'x' };
  b.hash = computeBlockHash(b);
  for (const env of [
    { blocks: [b], attestation: 'X' },
    { blocks: [b], receipt: 'X' },
    { blocks: [b], certificate: 'X' },
    { blocks: [b], extra: 1 },
  ]) {
    const r = verifyLedger(env);
    assert.equal(r.valid, false);
    assert.ok(r.errors.some((e) => /unsupported/i.test(e)));
  }
  assert.equal(verifyLedger({ blocks: [b] }).valid, true);
  assert.equal(verifyLedger([b]).valid, true);
});
