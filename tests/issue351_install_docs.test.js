import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readme = readFileSync(join(root, 'README.md'), 'utf8');

test('INSTALL_NO_PUBLIC', () => {
  assert.match(readme, /Preview only/);
  assert.match(readme, /npm pack/);
  assert.doesNotMatch(readme, /npm install -g @megabrain\/cli/);
  assert.doesNotMatch(readme, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('INSTALL_SCRIPTS', () => {
  assert.match(readme, /local SHA-256 chain only/);
  assert.match(readme, /local regex outline/);
  assert.match(readme, /JSON\/flags/);
  assert.doesNotMatch(readme, /wcag_check\.js style\.css/);
});

test('INSTALL_VERSION', () => {
  assert.match(readme, /3\.2\.0/);
  assert.match(readme, /megabrain --version/);
});
