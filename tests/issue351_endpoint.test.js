import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import assert from "node:assert/strict";
import { test } from "node:test";
import { validateEndpoint, getEndpoint, setEndpoint, saveConfig, loadConfig } from "../src/config.js";

function withXdg(fn) {
  const tmpdir = fs.mkdtempSync(path.join(os.tmpdir(), "ep-"));
  const xdg = path.join(tmpdir, "xdg");
  fs.mkdirSync(xdg, { recursive: true });
  const prev = process.env.XDG_CONFIG_HOME;
  process.env.XDG_CONFIG_HOME = xdg;
  try {
    fn(xdg);
  } finally {
    process.env.XDG_CONFIG_HOME = prev;
    fs.rmSync(tmpdir, { recursive: true, force: true });
  }
}

test("EP_REJECT_TOKEN_QUERY: endpoint com ?token= e rejeitado", () => {
  assert.throws(
    () => validateEndpoint("https://mcp.atlascommand.dev/mcp?token=redacted"),
    /parametro de consulta sensivel nao permitido/
  );
});

test("EP_REJECT_TOKEN_QUERY em env: env com ?token= nao substitui silenciosamente", () => {
  withXdg(() => {
    process.env.MEGABRAIN_ENDPOINT = "https://mcp.atlascommand.dev/mcp?token=redacted";
    try {
      assert.throws(() => getEndpoint(), /parametro de consulta sensivel nao permitido/);
    } finally {
      delete process.env.MEGABRAIN_ENDPOINT;
    }
  });
});

test("EP_REJECT_USERINFO: endpoint com userinfo e rejeitado", () => {
  assert.throws(
    () => validateEndpoint("https://user:pass@mcp.atlascommand.dev/mcp"),
    /credenciais.*userinfo/
  );
});

test("EP_REJECT_KEY_QUERY: endpoint com ?key= e rejeitado", () => {
  assert.throws(
    () => validateEndpoint("https://mcp.atlascommand.dev/mcp?key=redacted"),
    /parametro de consulta sensivel nao permitido/
  );
});

test("EP_REJECT_BEARER_QUERY: endpoint com ?bearer= e rejeitado", () => {
  assert.throws(
    () => validateEndpoint("https://mcp.atlascommand.dev/mcp?bearer=redacted"),
    /parametro de consulta sensivel nao permitido/
  );
});

test("EP_REJECT_JS_PROTOCOL: esquema javascript: e rejeitado", () => {
  assert.throws(() => validateEndpoint("javascript:alert(1)"), /protocolo nao permitido/);
});

test("EP_REJECT_FILE_PROTOCOL: esquema file: e rejeitado", () => {
  assert.throws(() => validateEndpoint("file:///etc/passwd"), /protocolo nao permitido/);
});

test("EP_REJECT_MALFORMED: URL malformada e rejeitada", () => {
  assert.throws(() => validateEndpoint("nao-e-url"), /URL malformada/);
});

test("EP_REJECT_EMPTY: valor vazio e rejeitado", () => {
  assert.throws(() => validateEndpoint(""), /valor ausente/);
});

test("EP_OK_HTTPS: https publico e aceito", () => {
  assert.equal(
    validateEndpoint("https://mcp.atlascommand.dev/mcp"),
    "https://mcp.atlascommand.dev/mcp"
  );
});

test("EP_OK_HTTPS: https publico com query nao sensivel e aceito", () => {
  assert.equal(
    validateEndpoint("https://mcp.atlascommand.dev/mcp?session=abc"),
    "https://mcp.atlascommand.dev/mcp?session=abc"
  );
});

test("EP_OK_HTTP_LOOPBACK: http loopback e aceito", () => {
  assert.equal(
    validateEndpoint("http://127.0.0.1:9000/mcp"),
    "http://127.0.0.1:9000/mcp"
  );
  assert.equal(
    validateEndpoint("http://localhost:9000/mcp"),
    "http://localhost:9000/mcp"
  );
});

test("EP_ENV_INVALID_NOT_SILENT: env invalido lanca erro em vez de cair no default", () => {
  withXdg(() => {
    process.env.MEGABRAIN_ENDPOINT = "javascript:alert(1)";
    let erro = null;
    try {
      getEndpoint();
    } catch (e) {
      erro = e;
    } finally {
      delete process.env.MEGABRAIN_ENDPOINT;
    }
    assert.ok(erro, "getEndpoint deve lancar erro com env invalido");
    assert.match(erro.message, /protocolo nao permitido/);
  });
});

test("EP_ENV_INVALID_NOT_SILENT: env invalido com token em query lanca erro", () => {
  withXdg(() => {
    process.env.MEGABRAIN_ENDPOINT = "https://mcp.atlascommand.dev/mcp?token=redacted";
    let erro = null;
    try {
      getEndpoint();
    } catch (e) {
      erro = e;
    } finally {
      delete process.env.MEGABRAIN_ENDPOINT;
    }
    assert.ok(erro, "getEndpoint deve lancar erro com env invalido");
    assert.match(erro.message, /parametro de consulta sensivel nao permitido/);
  });
});

test("EP_SAVE_REJECT_INVALID: setEndpoint rejeita antes de persistir", () => {
  withXdg(() => {
    assert.throws(
      () => setEndpoint("https://user:pass@mcp.atlascommand.dev/mcp"),
      /credenciais.*userinfo/
    );
    assert.equal(loadConfig().endpoint, undefined, "endpoint invalido nao pode ser persistido");
  });
});

test("EP_SAVE_REJECT_INVALID: saveConfig rejeita endpoint invalido", () => {
  withXdg(() => {
    assert.throws(
      () => saveConfig({ endpoint: "https://mcp.atlascommand.dev/mcp?token=redacted" }),
      /parametro de consulta sensivel nao permitido/
    );
    assert.equal(loadConfig().endpoint, undefined, "endpoint invalido nao pode ser persistido");
  });
});

test("EP_SAVE_OK_PERMISSIONS: save valido usa dir 0700 e file 0600", () => {
  withXdg((xdg) => {
    setEndpoint("https://mcp.atlascommand.dev/mcp");
    const configFile = path.join(xdg, "megabrain", "credentials.json");
    const dirMode = fs.statSync(path.dirname(configFile)).mode & 0o777;
    const fileMode = fs.statSync(configFile).mode & 0o777;
    assert.equal(dirMode, 0o700, `dir mode ${dirMode.toString(8)} != 0700`);
    assert.equal(fileMode, 0o600, `file mode ${fileMode.toString(8)} != 0600`);
    const saved = JSON.parse(fs.readFileSync(configFile, "utf8"));
    assert.equal(saved.endpoint, "https://mcp.atlascommand.dev/mcp");
    assert.equal(getEndpoint(), "https://mcp.atlascommand.dev/mcp");
  });
});

test("EP_ENV_EMPTY_FALLS_BACK: MEGABRAIN_ENDPOINT vazio cai no default", () => {
  withXdg(() => {
    process.env.MEGABRAIN_ENDPOINT = "";
    try {
      assert.equal(getEndpoint(), "https://mcp.atlascommand.dev/mcp");
    } finally {
      delete process.env.MEGABRAIN_ENDPOINT;
    }
  });
});

test("EP_STORED_EMPTY_FAILS: endpoint persistido vazio nao cai no default", () => {
  withXdg((xdg) => {
    const dir = path.join(xdg, "megabrain");
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    fs.writeFileSync(path.join(dir, "credentials.json"), JSON.stringify({ endpoint: "" }) + "\n", { mode: 0o600 });
    assert.throws(() => getEndpoint(), /valor ausente/);
  });
});
