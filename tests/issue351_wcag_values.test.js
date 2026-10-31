import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkWcag } from '../scripts/wcag_check.js';

test('WCAG_VALUES_INVALID_MATRIX: invalid colors and dimensions fail closed without NaN/null', () => {
  const invalidCases = [
    { name: 'negativo', fg: { r: -1, g: 0, b: 0 }, bg: '#ffffff' },
    { name: '>255', fg: { r: 256, g: 0, b: 0 }, bg: '#ffffff' },
    { name: 'NaN color', fg: { r: NaN, g: 0, b: 0 }, bg: '#ffffff' },
    { name: 'Infinity color', fg: { r: Infinity, g: 0, b: 0 }, bg: '#ffffff' },
    { name: 'objeto incompleto', fg: { r: 255 }, bg: '#ffffff' },
    { name: 'width "Infinity"', fg: '#000000', bg: '#ffffff', width: 'Infinity' },
    { name: 'width boolean true', fg: '#000000', bg: '#ffffff', width: true },
    { name: 'width boolean false', fg: '#000000', bg: '#ffffff', width: false },
    { name: 'width null', fg: '#000000', bg: '#ffffff', width: null },
    { name: 'width negativa', fg: '#000000', bg: '#ffffff', width: -10 },
    { name: 'width NaN', fg: '#000000', bg: '#ffffff', width: NaN },
  ];

  for (const c of invalidCases) {
    const res = checkWcag(c);
    assert.equal(res.valid, false, `${c.name} should fail`);
    assert.equal(Number.isFinite(res.contrast.ratio), true, `${c.name} ratio must be finite`);
    assert.equal(Number.isFinite(res.targetSize.width), true, `${c.name} width must be finite`);
    assert.equal(Number.isFinite(res.targetSize.height), true, `${c.name} height must be finite`);
    const json = JSON.stringify(res);
    assert.doesNotMatch(json, /"width":\s*null|"height":\s*null|"ratio":\s*null/, `${c.name} no null in json`);
  }
});

test('WCAG_VALUES_POSITIVES_AND_BOUNDARIES: valid combinations pass; white/white and under-target fail', () => {
  const pass = checkWcag({ fg: '#000000', bg: '#ffffff', width: 44, height: 44 });
  assert.equal(pass.valid, true);
  assert.equal(pass.contrast.passAA, true);
  assert.equal(pass.targetSize.pass, true);

  const aliasesPass = checkWcag({ foreground: { r: 0, g: 0, b: 0 }, background: { r: 255, g: 255, b: 255 } });
  assert.equal(aliasesPass.valid, true);

  const whiteOnWhite = checkWcag({ fg: '#ffffff', bg: '#ffffff', width: 44, height: 44 });
  assert.equal(whiteOnWhite.valid, false);
  assert.equal(whiteOnWhite.contrast.passAA, false);
  assert.equal(whiteOnWhite.contrast.ratio, 1);

  const belowTarget = checkWcag({ fg: '#000000', bg: '#ffffff', width: 24, height: 24 });
  assert.equal(belowTarget.valid, false);
  assert.equal(belowTarget.targetSize.pass, false);
  assert.equal(belowTarget.targetSize.width, 24);
  assert.equal(belowTarget.targetSize.height, 24);
});
