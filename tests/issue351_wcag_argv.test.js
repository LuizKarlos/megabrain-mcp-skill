import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { checkWcag } from '../scripts/wcag_check.js';

const SCRIPT = fileURLToPath(new URL('../scripts/wcag_check.js', import.meta.url));
const run = (args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

test('wcag argv grammar: equivalence, unknown flags, separated values, help, and json', () => {
  // ponytail: minimal subprocess runner covering argv grammar contract
  assert.equal(checkWcag({ fg: '#000000', bg: '#ffffff' }).valid, true);

  const eq = run(['--fg=#000', '--bg=#fff', '--width=48', '--json']);
  const sep = run(['--fg', '#000', '--bg', '#fff', '--width', '48', '--json']);
  assert.equal(eq.status, 0);
  assert.equal(sep.status, 0);
  assert.deepEqual(JSON.parse(eq.stdout), JSON.parse(sep.stdout));

  for (const flag of [['--foreground=#fff'], ['--background', '#fff'], ['--typo'], ['-x']]) {
    assert.notEqual(run(flag).status, 0);
  }

  const noFile = run(['--fg', '#000', '--json']);
  assert.equal(noFile.status, 0);

  const bad = [['--fg'], ['--fg='], ['--fg', '""'], ['--fg', '--bg', '#fff'], ['a.json', 'b.json'], ['a.json', '--fg', '#000'], ['--fg', '#0', '--fg', '#1']];
  for (const b of bad) {
    assert.notEqual(run(b).status, 0);
  }

  const help = run(['--help']);
  const helpFile = run(['-h', 'missing.json']);
  assert.equal(help.status, 0);
  assert.equal(helpFile.status, 0);
  assert.match(help.stdout, /Usage:/);

  const tmpDir = mkdtempSync(`${tmpdir()}/wcag-`);
  const tmpFile = `${tmpDir}/test.json`;
  try {
    writeFileSync(tmpFile, JSON.stringify({ fg: '#000000', bg: '#ffffff', width: 44, height: 44 }));
    const fRes = run([tmpFile, '--json']);
    assert.equal(fRes.status, 0);
    assert.equal(JSON.parse(fRes.stdout).valid, true);
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }
});
