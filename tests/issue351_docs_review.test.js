import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-review/SKILL.md'), 'utf8');
const slop = readFileSync(join(root, 'megabrain-review/references/anti-slop-patterns.md'), 'utf8');
const dual = readFileSync(join(root, 'megabrain-review/references/dual-blind-adjudication.md'), 'utf8');
const voice = readFileSync(join(root, 'megabrain-review/references/voice-calibration.md'), 'utf8');
const docs = skill + slop + dual + voice;

test('DOCS_REV_APPROVED', () => {
  assert.match(skill, /megabrain\.adjudicate_consensus/);
  assert.match(skill, /approved/);
  assert.match(docs, /não é autorização/);
  assert.match(docs, /advisory/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_REV_NO_ARBITER', () => {
  assert.match(skill, /Jev é só advisory/);
  assert.match(dual, /nenhum árbitro LLM server-side/);
  assert.doesNotMatch(skill, /third-party arbiter/);
});

test('DOCS_REV_JSON', () => {
  assert.match(skill, /megabrain\.anti_slop_lint/);
  assert.match(skill, /megabrain\.voice_calibrate/);
  assert.match(slop, /JSON objeto/);
  assert.match(voice, /JSON objeto/);
  assert.doesNotMatch(slop, /call anti_slop_lint --text/);
});
