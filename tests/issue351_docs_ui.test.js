import { readFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
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
test('DOCS_UI_CALLS_AND_AST', () => {
  const calls = [...skill.matchAll(/megabrain call (\S+) '([^']+)'/g)].map(m => ({ tool: m[1], json: JSON.parse(m[2]) }));
  assert.ok(calls.length >= 5);
  for (const c of calls) assert.equal(typeof c.json, 'object');
  const cap = calls.find(c => c.tool === 'megabrain.playwright_capture');
  assert.ok(cap && cap.json.url && !('html_content' in cap.json));
  assert.match(cap.json.url, /^https?:\/\/(127\.0\.0\.1|localhost)/);
  for (const t of ['megabrain.summarize_visual_tdd', 'megabrain.dom_audit']) {
    assert.ok(calls.find(c => c.tool === t)?.json.html_content);
  }
  for (const t of ['megabrain.css_validator', 'megabrain.design_tokens']) {
    assert.ok(calls.find(c => c.tool === t)?.json.css_content);
  }
  const buf = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
  assert.equal(buf.subarray(0, 4).toString('latin1'), '\x89PNG');
  assert.match(skill, /89 50 4E 47/);
  const kPath = process.env.MEGABRAIN_KERNEL_SOURCE || '/srv/megabrain-dev/repository/runtime/mcp_server.py';
  const sigs = existsSync(kPath)
    ? JSON.parse(execSync('python3 - <<PY\nimport ast, json\ntree = ast.parse(open("' + kPath + '").read())\nprint(json.dumps({n.name: [a.arg for a in n.args.args] for n in ast.walk(tree) if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))}))\nPY', { encoding: 'utf8' }))
    : { playwright_capture_tool: ['url', 'viewport', 'full_page', 'wait_selector', 'timeout_ms'], summarize_visual_tdd_tool: ['html_content', 'target', 'rules', 'color_pairs'] };
  assert.ok(Object.keys(cap.json).every(k => sigs.playwright_capture_tool.includes(k)));
  assert.ok(sigs.summarize_visual_tdd_tool.includes('html_content'));
});
