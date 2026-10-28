import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const skill = readFileSync(join(root, 'megabrain-ui/SKILL.md'), 'utf8');
const tokens = readFileSync(join(root, 'megabrain-ui/references/design-tokens-spec.md'), 'utf8');
const visual = readFileSync(join(root, 'megabrain-ui/references/visual-tdd-methodology.md'), 'utf8');
const wcag = readFileSync(join(root, 'megabrain-ui/references/wcag-target-sizes.md'), 'utf8');
const docs = skill + tokens + visual + wcag;

test('DOCS_UI_CONTENT', () => {
  assert.match(skill, /megabrain\.playwright_capture/);
  assert.match(skill, /html_content/);
  assert.match(skill, /megabrain\.design_tokens/);
  assert.match(skill, /action/);
  assert.match(skill, /css_content/);
  assert.doesNotMatch(skill, /localhost:3000/);
  assert.doesNotMatch(docs, new RegExp(['Luiz', 'Karlos'].join('')));
});

test('DOCS_UI_NO_SSRF', () => {
  assert.match(visual, /Sem SSRF/);
  assert.match(skill, /megabrain\.dom_audit/);
  assert.match(skill, /megabrain\.summarize_visual_tdd/);
  assert.doesNotMatch(skill, /css_path/);
});

test('DOCS_UI_WCAG_LOCAL', () => {
  assert.match(wcag, /JSON\/flags/);
  assert.match(docs, /não é.*headless/i);
  assert.match(tokens, /css_content/);
  assert.doesNotMatch(tokens, /--css_path/);
});
