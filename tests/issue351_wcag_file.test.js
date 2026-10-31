import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const SCRIPT = fileURLToPath(new URL('../scripts/wcag_check.js', import.meta.url));
const TMP = mkdtempSync(join(tmpdir(), 'wcag_i379_'));

const run = (args) => spawnSync(process.execPath, [SCRIPT, '--json', ...args], { encoding: 'utf8' });

test('WCAG_MISSING: nonexistent file fails closed (non-zero, never valid)', () => {
  const r = run([join(TMP, 'nope.json')]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr || '', /ENOENT|no such file/i);
  assert.doesNotMatch(r.stdout || '', /"valid":\s*true/);
});

test('WCAG_CSS_FILE: CSS file is not valid JSON, fails closed', () => {
  const f = join(TMP, 'style.css');
  writeFileSync(f, 'body { color: red }');
  const r = run([f]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr || '', /SyntaxError|Unexpected/i);
  assert.doesNotMatch(r.stdout || '', /"valid":\s*true/);
});

test('WCAG_BAD_JSON: malformed JSON fails closed', () => {
  const f = join(TMP, 'bad.json');
  writeFileSync(f, '{ fg: "#000", bg: "#fff" }');
  const r = run([f]);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr || '', /SyntaxError|Unexpected/i);
  assert.doesNotMatch(r.stdout || '', /"valid":\s*true/);
});

test('WCAG_OK_FLAGS: explicit fg/bg flags still compute a passing result', () => {
  const r = run(['--fg=#000000', '--bg=#ffffff']);
  assert.equal(r.status, 0);
  const out = JSON.parse(r.stdout);
  assert.equal(out.valid, true);
  assert.equal(out.contrast.passAA, true);
  assert.equal(out.contrast.ratio, 21);
  assert.equal(out.targetSize.pass, true);
});

test('WCAG_WHITE_WHITE: white-on-white with target under 44px fails', () => {
  const f = join(TMP, 'ww.json');
  writeFileSync(f, JSON.stringify({ fg: '#ffffff', bg: '#ffffff', width: 24, height: 24 }));
  const r = run([f]);
  assert.notEqual(r.status, 0);
  const out = JSON.parse(r.stdout);
  assert.equal(out.valid, false);
  assert.equal(out.contrast.ratio, 1);
  assert.equal(out.contrast.passAA, false);
  assert.equal(out.targetSize.pass, false);
});

test('WCAG_INCOMPLETE_JSON: empty object does not inherit green defaults', () => {
  const f = join(TMP, 'empty.json');
  writeFileSync(f, '{}');
  const r = run([f]);
  assert.notEqual(r.status, 0);
  const out = JSON.parse(r.stdout);
  assert.equal(out.valid, false);
});

test('cleanup', () => { rmSync(TMP, { recursive: true, force: true }); });
