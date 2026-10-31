# Epic 351 / Issue 393 — setup harness matrix

Status: BLOCKED
CLI: @megabrain/cli 3.2.0
Help command: node bin/megabrain.js setup --help
Help exit: 0

## Probe (disposable dest)

Dest: /tmp/mb-setup-393-1793154888248694489
Setup without --write-mcp exit: 1
mcp json after first run exists: no
Setup with --write-mcp exit: 1
mcp json after second run exists: yes
Authorization value: Bearer ${MEGABRAIN_TOKEN}
Secret plaintext in file/stdout: no

## Harness matrix

.cursor: detected only if .cursor exists in cwd; copy of megabrain.mdc is not native install; connection parser/client: none; result: BLOCKED
.vscode: detected only if .vscode exists in cwd; no mcp.json writer for this harness; connection parser/client: none; result: BLOCKED
.hermes: detected only if $HOME/.hermes exists; no Hermes native client install; connection parser/client: none; result: BLOCKED
Generic dest copy: files copied to dest; not harness integration PASS; result: BLOCKED

## Verdict

Detection and generic copy are not integration PASS.
Write without --write-mcp remains forbidden.
Each harness stays BLOCKED until a dedicated parser/client exists.
User config was not modified. Disposable dest only.

## Not done

- No production or test file edited.
- No user HOME config mutated.
- No secret stored.
