import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const BIN = fileURLToPath(new URL('../bin/megabrain.js', import.meta.url));

function runCli(args) {
  return spawnSync(process.execPath, [BIN, ...args], { encoding: 'utf8' });
}

test('PARSER_BOGUS: unknown flag is rejected by the native parser', () => {
  const result = runCli(['--bogus']);
  assert.notStrictEqual(result.status, 0, `expected non-zero exit, got ${result.status}`);
  assert.match(result.stderr, /--bogus/);
});

test('PARSER_WAIT: removed --wait flag is rejected by the native parser', () => {
  const result = runCli(['status', '--wait']);
  assert.notStrictEqual(result.status, 0, `expected non-zero exit, got ${result.status}`);
  assert.match(result.stderr, /--wait/);
});

test('PARSER_HELP_NO_WAIT: help output does not advertise --wait', () => {
  const result = runCli(['--help']);
  assert.strictEqual(result.status, 0, `expected zero exit, got ${result.status}`);
  assert.match(result.stdout, /Usage:/);
  assert.doesNotMatch(result.stdout, /--wait/);
});

test("PARSER_TOKEN_NO_VALUE", () => {
  const result = runCli(["--token", "secret-parser-377"]);
  assert.notStrictEqual(result.status, 0);
  assert.ok(!result.stdout.includes("secret-parser-377"));
  assert.ok(!result.stderr.includes("secret-parser-377"));
});

test("PARSER_VALID_FLAGS_REACH", () => {
  const result = runCli(["--version", "--dest", "/tmp", "--write-mcp", "--json"]);
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /[0-9]/);
});

test("PARSER_HELP_IMPLEMENTED_ONLY", () => {
  const result = runCli(["--help"]);
  assert.strictEqual(result.status, 0);
  assert.match(result.stdout, /--dest/);
  assert.match(result.stdout, /--write-mcp/);
  assert.match(result.stdout, /--json/);
  assert.match(result.stdout, /--endpoint/);
  assert.doesNotMatch(result.stdout, /--wait/);
  assert.doesNotMatch(result.stdout, /--token/);
});
