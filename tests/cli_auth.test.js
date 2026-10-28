import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import http from 'node:http';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const binPath = path.join(repoRoot, 'bin', 'megabrain.js');
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

function runCliAsync(args, envOverrides = {}) {
  return new Promise((resolve) => {
    const env = { ...process.env, ...envOverrides };
    const child = spawn(process.execPath, [binPath, ...args], { env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => { stdout += d; });
    child.stderr.on('data', d => { stderr += d; });
    child.on('close', (code) => {
      resolve({ status: code, stdout, stderr });
    });
  });
}

test('1. Permissoes de arquivo credentials.json (0600) e diretorio (0700)', async () => {
  const tmpDir = path.join(os.tmpdir(), `mb-perm-${Date.now()}`);
  const prevXdg = process.env.XDG_CONFIG_HOME;
  process.env.XDG_CONFIG_HOME = tmpDir;

  try {
    const { saveConfig, loadConfig, getConfigDir, getConfigFile } = await import(`../src/config.js?t=${Date.now()}`);

    saveConfig({ token: 'initial-token', endpoint: 'http://example.com/mcp' });

    const dir = getConfigDir();
    const file = getConfigFile();

    assert.ok(fs.existsSync(dir), 'Config directory exists');
    assert.ok(fs.existsSync(file), 'Credentials file exists');

    const dirMode = fs.statSync(dir).mode & 0o777;
    const fileMode = fs.statSync(file).mode & 0o777;

    assert.equal(dirMode.toString(8), '700', 'Directory permissions must be 0700');
    assert.equal(fileMode.toString(8), '600', 'File permissions must be 0600');

    // Testar correcao de permissoes
    fs.chmodSync(dir, 0o755);
    fs.chmodSync(file, 0o644);

    saveConfig({ updated: true });
    assert.equal((fs.statSync(dir).mode & 0o777).toString(8), '700', 'Directory re-enforced to 0700');
    assert.equal((fs.statSync(file).mode & 0o777).toString(8), '600', 'File re-enforced to 0600');

    const loaded = loadConfig();
    assert.equal(loaded.token, 'initial-token');
    assert.equal(loaded.updated, true);
  } finally {
    if (prevXdg !== undefined) process.env.XDG_CONFIG_HOME = prevXdg;
    else delete process.env.XDG_CONFIG_HOME;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('2. Chamadas de bin/megabrain.js com --version, --help, status --json, call megabrain.health', async () => {
  // --version, -v, version
  const v1 = await runCliAsync(['--version']);
  assert.equal(v1.status, 0);
  assert.equal(v1.stdout.trim(), pkg.version);

  const v2 = await runCliAsync(['-v']);
  assert.equal(v2.status, 0);
  assert.equal(v2.stdout.trim(), pkg.version);

  const v3 = await runCliAsync(['version']);
  assert.equal(v3.status, 0);
  assert.equal(v3.stdout.trim(), pkg.version);

  // --help, -h, help, no args
  const h1 = await runCliAsync(['--help']);
  assert.equal(h1.status, 0);
  assert.match(h1.stdout, /MegaBrain CLI/);

  const h2 = await runCliAsync(['-h']);
  assert.equal(h2.status, 0);
  assert.match(h2.stdout, /Usage:/);

  const h3 = await runCliAsync(['help']);
  assert.equal(h3.status, 0);
  assert.match(h3.stdout, /Commands:/);

  const h4 = await runCliAsync([]);
  assert.equal(h4.status, 0);
  assert.match(h4.stdout, /Commands:/);

  // Mock server para status e call
  const server = http.createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'HEALTHY', mock: true }));
      return;
    }
    if (req.url === '/mcp') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        const payload = JSON.parse(body);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: payload.id,
          result: { tool: payload.params?.name, status: 'ok', receivedAuth: req.headers.authorization }
        }));
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const mockEndpoint = `http://127.0.0.1:${port}/mcp`;
  const fbCalls = [];
  const fbServer = http.createServer((req, res) => {
    if (req.url !== '/mcp') { res.writeHead(404); res.end(); return; }
    let body = '';
    req.on('data', c => { body += c; });
    req.on('end', () => {
      const p = JSON.parse(body);
      fbCalls.push({ tool: p.params?.name, auth: req.headers.authorization });
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ jsonrpc: '2.0', id: p.id, result: { tool: p.params?.name, status: 'ok', receivedAuth: req.headers.authorization } }));
    });
  });
  await new Promise(r => fbServer.listen(0, '127.0.0.1', r));
  const fbEndpoint = `http://127.0.0.1:${fbServer.address().port}/mcp`;

  try {
    const sRes = await runCliAsync(['status', '--json', '--endpoint', mockEndpoint]);
    assert.equal(sRes.status, 0);
    const parsedStatus = JSON.parse(sRes.stdout);
    assert.equal(parsedStatus.endpoint, mockEndpoint);
    assert.equal(parsedStatus.status, 'HEALTHY');
    assert.equal(parsedStatus.health.mock, true);

    const fRes = await runCliAsync(['status', '--json', '--endpoint', fbEndpoint], { MEGABRAIN_TOKEN: 'secret-agent-token' });
    assert.equal(fRes.status, 0);
    JSON.parse(fRes.stdout);
    const healthCall = fbCalls.find(c => c.tool === 'megabrain.health');
    assert.ok(healthCall, 'fallback must call canonical megabrain.health');
    assert.equal(healthCall.auth, 'Bearer secret-agent-token');

    const cRes = await runCliAsync([
      'call', 'megabrain.health', '{}',
      '--endpoint', mockEndpoint,
      '--json'
    ], { MEGABRAIN_TOKEN: 'secret-agent-token' });
    assert.equal(cRes.status, 0);
    const parsedCall = JSON.parse(cRes.stdout);
    assert.equal(parsedCall.tool, 'megabrain.health');
    assert.equal(parsedCall.status, 'ok');
    assert.equal(parsedCall.receivedAuth, 'Bearer secret-agent-token');
  } finally {
    server.close();
    fbServer.close();
  }
});

test('3. Fallback e prioridade de variaveis de ambiente MEGABRAIN_TOKEN e MEGABRAIN_ENDPOINT', async () => {
  const tmpDir = path.join(os.tmpdir(), `mb-prio-${Date.now()}`);
  const cDir = path.join(tmpDir, 'megabrain');
  fs.mkdirSync(cDir, { recursive: true });

  let lastAuth = null;
  const server = http.createServer((req, res) => {
    lastAuth = req.headers.authorization || null;
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'HEALTHY' }));
      return;
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const payload = body ? JSON.parse(body) : {};
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ jsonrpc: '2.0', id: payload.id || 1, result: { auth: lastAuth } }));
    });
  });

  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const port = server.address().port;
  const mockEndpoint = `http://127.0.0.1:${port}/mcp`;

  const fileEndpoint = mockEndpoint;
  const fileToken = 'token-from-credentials-file';

  fs.writeFileSync(
    path.join(cDir, 'credentials.json'),
    JSON.stringify({ endpoint: fileEndpoint, token: fileToken }, null, 2),
    { mode: 0o600 }
  );

  const envDefaults = {
    XDG_CONFIG_HOME: tmpDir,
    MEGABRAIN_ENDPOINT: '',
    MEGABRAIN_TOKEN: '',
  };

  try {
    // 3a. Prioridade de Endpoint:
    // Caso 1: Apenas arquivo configurado -> deve usar fileEndpoint
    const s1 = await runCliAsync(['status', '--json'], {
      ...envDefaults,
      MEGABRAIN_ENDPOINT: '',
      MEGABRAIN_TOKEN: '',
    });
    assert.equal(s1.status, 0);
    const p1 = JSON.parse(s1.stdout || '{}');
    assert.equal(p1.endpoint, fileEndpoint, 'Fallback to credentials.json endpoint when no env or flag');

    // Caso 2: Env var setada -> deve sobrepor arquivo
    const envEndpoint = `http://127.0.0.1:${port}/env-mcp`;
    const s2 = await runCliAsync(['status', '--json'], {
      ...envDefaults,
      MEGABRAIN_ENDPOINT: envEndpoint,
    });
    assert.equal(s2.status, 0);
    const p2 = JSON.parse(s2.stdout || '{}');
    assert.equal(p2.endpoint, envEndpoint, 'MEGABRAIN_ENDPOINT must override credentials.json');

    // Caso 3: Flag --endpoint -> deve sobrepor Env var e arquivo
    const flagEndpoint = `http://127.0.0.1:${port}/flag-mcp`;
    const s3 = await runCliAsync(['status', '--json', '--endpoint', flagEndpoint], {
      ...envDefaults,
      MEGABRAIN_ENDPOINT: envEndpoint,
    });
    assert.equal(s3.status, 0);
    const p3 = JSON.parse(s3.stdout || '{}');
    assert.equal(p3.endpoint, flagEndpoint, '--endpoint flag must override MEGABRAIN_ENDPOINT and credentials.json');

    // 3b. Prioridade de Token:
    // Caso 1: Apenas arquivo configurado -> deve enviar fileToken
    lastAuth = null;
    const c1 = await runCliAsync(['call', 'megabrain.test', '{}', '--endpoint', mockEndpoint, '--json'], {
      ...envDefaults,
      MEGABRAIN_TOKEN: '',
    });
    assert.equal(c1.status, 0);
    assert.equal(lastAuth, `Bearer ${fileToken}`, 'Fallback to credentials.json token');

    // Caso 2: Env var setada -> deve sobrepor arquivo
    lastAuth = null;
    const c2 = await runCliAsync(['call', 'megabrain.test', '{}', '--endpoint', mockEndpoint, '--json'], {
      ...envDefaults,
      MEGABRAIN_TOKEN: 'token-from-env',
    });
    assert.equal(c2.status, 0);
    assert.equal(lastAuth, 'Bearer token-from-env', 'MEGABRAIN_TOKEN must override credentials.json token');

    // Caso 3: Flag --token rejeitada
    const c3 = await runCliAsync(['call', 'test', '{}', '--endpoint', mockEndpoint, '--token', 'token-from-flag', '--json'], {
      ...envDefaults,
      MEGABRAIN_TOKEN: 'token-from-env',
    });
    assert.equal(c3.status, 1);
    assert.ok(!c3.stderr.includes('token-from-flag'));

    // 3c. Preservacao de endpoint customizado durante login sem --endpoint
    const l1 = await runCliAsync(['login', '--json'], { ...envDefaults, MEGABRAIN_TOKEN: 'another-token', MEGABRAIN_ENDPOINT: '' });
    assert.equal(l1.status, 0);
    const credContent = JSON.parse(fs.readFileSync(path.join(cDir, 'credentials.json'), 'utf8'));
    assert.equal(credContent.token, 'another-token');
    assert.equal(credContent.endpoint, fileEndpoint, 'login command without --endpoint must NOT clobber custom endpoint');
    const noTok = await runCliAsync(['login'], { ...envDefaults, MEGABRAIN_TOKEN: '', XDG_CONFIG_HOME: path.join(tmpDir, 'nc') });
    assert.ok(noTok.status === 1 && !fs.existsSync(path.join(tmpDir, 'nc')));
  } finally {
    server.close();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('4. Codigos de saida de erro quando argumentos invalidos sao passados', async () => {
  const r1 = await runCliAsync(['invalid_command_xyz']);
  assert.equal(r1.status, 1, 'Unknown command should exit with code 1');
  assert.match(r1.stderr, /Unknown command: 'invalid_command_xyz'/);

  const r2 = await runCliAsync(['call']);
  assert.equal(r2.status, 1, 'call without tool name should exit with code 1');
  assert.match(r2.stderr, /Tool name required/);

  const r3 = await runCliAsync(['call', 'megabrain.some_tool', '{not-json']);
  assert.equal(r3.status, 1, 'call with malformed JSON should exit with code 1');
  assert.match(r3.stderr, /Invalid JSON arguments/);

  const r4 = await runCliAsync(['status', '--endpoint', 'not_a_valid_url']);
  assert.equal(r4.status, 1, 'status with invalid endpoint URL should exit with code 1');
  assert.match(r4.stderr, /Invalid URL/);
});

test('5. Suporte nativo a .env local no CLI sem dependencias externas', async () => {
  if (typeof process.loadEnvFile !== 'function') return;
  const tmpDir = path.join(os.tmpdir(), `mb-env-${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  fs.writeFileSync(path.join(tmpDir, '.env'), 'MEGABRAIN_ENDPOINT=https://custom-test.local/mcp\n');
  try {
    const res = await new Promise((resolve) => {
      const env = { ...process.env, NODE_OPTIONS: '--import data:text/javascript,globalThis.fetch=async()=>new%20Response(JSON.stringify({status:%22ok%22}))' };
      delete env.MEGABRAIN_ENDPOINT;
      delete env.MEGABRAIN_TOKEN;
      const child = spawn(process.execPath, [binPath, 'status', '--json'], { env, cwd: tmpDir });
      let stdout = '';
      child.stdout.on('data', d => { stdout += d; });
      child.on('close', code => resolve({ status: code, stdout }));
    });
    assert.equal(res.status, 0);
    const parsed = JSON.parse(res.stdout || '{}');
    assert.equal(parsed.endpoint, 'https://custom-test.local/mcp');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('6. setup --write-mcp grava megabrain.mcp.json sem token plaintext', async () => {
  const tmp = path.join(os.tmpdir(), `mb-setup-${Date.now()}`);
  const cfg = path.join(tmp, 'megabrain.mcp.json');
  try {
    const r1 = await runCliAsync(['setup', '--dest', tmp, '--endpoint', 'http://127.0.0.1:65534', '--json'], { MEGABRAIN_TOKEN: 'sec1' });
    assert.equal(fs.existsSync(cfg), false);
    const r2 = await runCliAsync(['setup', '--dest', tmp, '--write-mcp', '--endpoint', 'http://127.0.0.1:65534', '--json'], { MEGABRAIN_TOKEN: 'sec1' });
    assert.equal(fs.existsSync(cfg), true);
    const data = JSON.parse(fs.readFileSync(cfg, 'utf8'));
    assert.equal(data.mcpServers.megabrain.url, 'http://127.0.0.1:65534');
    assert.equal(data.mcpServers.megabrain.headers.Authorization, 'Bearer ${MEGABRAIN_TOKEN}');
    assert.ok(!r1.stdout.includes('sec1') && !r2.stdout.includes('sec1') && !JSON.stringify(data).includes('sec1'));
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
