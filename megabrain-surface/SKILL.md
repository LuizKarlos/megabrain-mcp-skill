---
name: megabrain-surface
version: 3.2.0
description: Operational reference for MegaBrain MCP surface covering tools, aliases, resources, prompts, roles, transports, observability, and errors.
---

# Superfície operacional — parte 1

## megabrain.health
Assinatura: `megabrain.health()` -> status, kernel_ready, roles_count, components.
Limite: Chamada operacional síncrona sem efeitos colaterais.
```bash
megabrain call megabrain.health '{}'
```

## megabrain.inspect
Assinatura: `megabrain.inspect(mission_id)` (aceita execution_id/receipt_id).
Limite: Leitura de estado de missão ou execução anterior.
```bash
megabrain call megabrain.inspect '{"mission_id":"mission-123"}'
```

## megabrain.inspect_work
Assinatura: `megabrain.inspect_work(work_id)` -> tasks, events, attestation.
Limite: Consulta do registro imutável do WorkRecord e eventos criptográficos.
```bash
megabrain call megabrain.inspect_work '{"work_id":"work-123"}'
```

## megabrain.refine_prompt
Assinatura: `megabrain.refine_prompt(prompt, context, risk_level)`.
Limite: Refinamento de contrato e validação antes da execução.
```bash
megabrain call megabrain.refine_prompt '{"prompt":"Build feature","context":"Context repo","risk_level":"MEDIUM"}'
```

## megabrain.recommend
Assinatura: `megabrain.recommend(instruction)`.
Limite: kernel-only -> NO_EXECUTABLE_ROUTE + execution_ready:false.
```bash
megabrain call megabrain.recommend '{"instruction":"Analyze repository structure"}'
```

## megabrain.infer
Assinatura: `megabrain.infer(instruction)`.
Limite: DEPRECATED / kernel-only, fail-closed sob isolamento soberano.
```bash
megabrain call megabrain.infer '{"instruction":"Direct inference call"}'
```
## Superfície de governança e operação — parte 2

### megabrain.grant_approval
Assinatura: `megabrain.grant_approval(work_id, task_id, approver="user")` -> approved, work_id, task_id, state.
Limite: Aprovação explícita de task em WAITING_APPROVAL transicionando para RUNNING.
```bash
megabrain call megabrain.grant_approval '{"work_id":"work-123","task_id":"t1","approver":"user"}'
```

### megabrain.resume_pipeline
Assinatura: `megabrain.resume_pipeline(work_id, test_commands=None)` -> status, work_id, execution_state.
Limite: Retoma pipeline pausado ou aguardando aprovação com novos comandos de teste.
```bash
megabrain call megabrain.resume_pipeline '{"work_id":"work-123","test_commands":{"t1":{"status":"GREEN","exit_code":0}}}'
```

### megabrain.evaluate_execution_canary
Assinatura: `megabrain.evaluate_execution_canary(primary_output, reference_output, max_allowed_divergence=0.05, critical_keys=None)` -> status, divergence, passed.
Limite: Avalia divergência de execução entre outputs primário e referência com tolerância default de 0.05.
```bash
megabrain call megabrain.evaluate_execution_canary '{"primary_output":{"status":"GREEN","exit_code":0},"reference_output":{"status":"GREEN","exit_code":0}}'
```

### megabrain.get_mission_scorecard
Assinatura: `megabrain.get_mission_scorecard(work_id)` -> work_id, scorecard, metrics.
Limite: Consulta consolidada do scorecard executivo cobrindo tarefas e métricas da missão.
```bash
megabrain call megabrain.get_mission_scorecard '{"work_id":"work-123"}'
```

### megabrain.get_telemetry_report
Assinatura: `megabrain.get_telemetry_report()` -> metrics, distribution, uptime.
Limite: Consulta contadores vivos e telemetria operacional sem efeitos colaterais.
```bash
megabrain call megabrain.get_telemetry_report '{}'
```

### megabrain.export_client_config
Assinatura: `megabrain.export_client_config(client_type="all", tunnel_url=None, auth_token=None)` -> status, configs, client_type.
Limite: Rejeita query sensível e userinfo no endpoint; nunca incluir token ou credencial no exemplo.
```bash
megabrain call megabrain.export_client_config '{"client_type":"cursor","tunnel_url":"https://mcp.atlascommand.dev/mcp"}'
```

## Aliases underscore — 38/38

Regra 1:1: `megabrain.<tool>` ↔ `megabrain_<tool>`; ambos aceitos pelo CLI; alias não é tool nova.
Gramática do CLI: aceita `megabrain.health` e `megabrain_health`; rejeita `megabrain.`, `megabrain..health` e string vazia; argumentos devem ser JSON objeto (array/null rejeitados).

```bash
megabrain call megabrain_health '{}'
```
Equivalente a `megabrain call megabrain.health '{}'`.

- megabrain.adjudicate_consensus -> megabrain_adjudicate_consensus
- megabrain.anti_slop_lint -> megabrain_anti_slop_lint
- megabrain.arbitrate_concurrency -> megabrain_arbitrate_concurrency
- megabrain.coordinate_mission_swarm -> megabrain_coordinate_mission_swarm
- megabrain.create_checkpoint -> megabrain_create_checkpoint
- megabrain.css_validator -> megabrain_css_validator
- megabrain.decompose -> megabrain_decompose
- megabrain.design_tokens -> megabrain_design_tokens
- megabrain.dispatch_subtask -> megabrain_dispatch_subtask
- megabrain.dom_audit -> megabrain_dom_audit
- megabrain.evaluate_execution_canary -> megabrain_evaluate_execution_canary
- megabrain.execute_pipeline -> megabrain_execute_pipeline
- megabrain.export_audit_ledger -> megabrain_export_audit_ledger
- megabrain.export_client_config -> megabrain_export_client_config
- megabrain.export_evidence_pack -> megabrain_export_evidence_pack
- megabrain.get_mission_scorecard -> megabrain_get_mission_scorecard
- megabrain.get_parallel_waves -> megabrain_get_parallel_waves
- megabrain.get_telemetry_report -> megabrain_get_telemetry_report
- megabrain.grant_approval -> megabrain_grant_approval
- megabrain.heal_dependency_graph -> megabrain_heal_dependency_graph
- megabrain.health -> megabrain_health
- megabrain.infer -> megabrain_infer
- megabrain.inspect -> megabrain_inspect
- megabrain.inspect_work -> megabrain_inspect_work
- megabrain.orchestrate -> megabrain_orchestrate
- megabrain.playwright_capture -> megabrain_playwright_capture
- megabrain.readability_score -> megabrain_readability_score
- megabrain.recommend -> megabrain_recommend
- megabrain.refine_prompt -> megabrain_refine_prompt
- megabrain.resume_pipeline -> megabrain_resume_pipeline
- megabrain.rollback_checkpoint -> megabrain_rollback_checkpoint
- megabrain.slice_ast_context -> megabrain_slice_ast_context
- megabrain.summarize_visual_tdd -> megabrain_summarize_visual_tdd
- megabrain.synthesize_backend_contract -> megabrain_synthesize_backend_contract
- megabrain.synthesize_subtask -> megabrain_synthesize_subtask
- megabrain.time_travel_replay -> megabrain_time_travel_replay
- megabrain.verify_subtask -> megabrain_verify_subtask
- megabrain.voice_calibrate -> megabrain_voice_calibrate

## Resources — parte 4

Catálogo MCP de recursos estáticos e templates parametrizados.

### Recursos diretos
- `megabrain://workrecords`
- `megabrain://ledgers`
- `megabrain://contracts`

### Resource templates
- `megabrain://workrecords/{work_id}`
- `megabrain://ledgers/{work_id}`
- `megabrain://contracts/{operation_id}`

### Exemplo JSON-RPC `resources/read`
Requisição:
```json
{"jsonrpc":"2.0","id":1,"method":"resources/read","params":{"uri":"megabrain://workrecords/work-123"}}
```

Resposta de sucesso:
```json
{"jsonrpc":"2.0","id":1,"result":{"contents":[{"uri":"megabrain://workrecords/work-123","mimeType":"application/json","text":"{\"work_id\":\"work-123\"}"}]}}
```

Resposta de erro (-32002):
```json
{"jsonrpc":"2.0","id":1,"error":{"code":-32002,"message":"Resource not found"}}
```

Nota: `megabrain call` NAO le
resources; resources exigem `POST /mcp` com Bearer.

## Prompts — parte 5

Catálogo de prompts interativos estruturados.

### Prompts disponíveis
- `sovereign-mission` — args `objective` (obrigatorio), `risk_level` (default `LOW`).
- `consensus-adjudication` — args `task_id` (obrigatorio), `min_confidence` (default `0.80`), `required_verdict` (default `APPROVED`).

### Exemplos JSON-RPC `prompts/get`

Requisição `sovereign-mission`:
```json
{"jsonrpc":"2.0","id":1,"method":"prompts/get","params":{"name":"sovereign-mission","arguments":{"objective":"run pipeline","risk_level":"LOW"}}}
```

Resposta de retorno (`messages` role `user`, content text):
```json
{"jsonrpc":"2.0","id":1,"result":{"messages":[{"role":"user","content":{"type":"text","text":"Executar sovereign mission..."}}]}}
```

Requisição `consensus-adjudication`:
```json
{"jsonrpc":"2.0","id":2,"method":"prompts/get","params":{"name":"consensus-adjudication","arguments":{"task_id":"task-123","min_confidence":"0.80","required_verdict":"APPROVED"}}}
```

Resposta de erro (-32602 Invalid params para prompt desconhecido ou argumento obrigatorio ausente):
```json
{"jsonrpc":"2.0","id":3,"error":{"code":-32602,"message":"Invalid params"}}
```

Nota: `megabrain call` NAO executa prompts; prompts exigem `POST /mcp` com Bearer.

## Roles

Nota kernel-only: contratos de governança; zero providers/models; role não executa inferência.

### Catalogo Canonico
- `mission_compiler` — Compiles initial mission prompts, synthesizes requirements, and defines architectural strategy. Capabilities: `chat`. Work product: `PLAN`.
- `cartographer` — Maps repository architecture, dependencies, and file layout. Capabilities: `chat`. Work product: `ANALYSIS`.
- `implementer` — Primary code generator creating atomic patch units. Capabilities: `chat`, `tool_calling`. Work product: `IMPLEMENTATION`.
- `reviewer` — Independent verification ensuring regression-free code, spec compliance, and operational criteria. Capabilities: `chat`. Work product: `REVIEW`.
- `failure_diagnostician` — Root-cause diagnosis for test failures and error traces. Capabilities: `chat`, `reasoning`. Work product: `ANALYSIS`.
- `creative_copywriter` — Persuasive and humanized copywriting with active AI slop elimination. Capabilities: `chat`. Work product: `ANALYSIS`.

### Aliases Legados
- `adjudicator` -> `reviewer`
- `architecture_adjudicator` -> `reviewer`
- `brand_strategist` -> `mission_compiler`
- `chief_architect` -> `mission_compiler`
- `code_reviewer` -> `reviewer`
- `copywriter` -> `creative_copywriter`
- `critical_acceptance` -> `reviewer`
- `diagnostician` -> `failure_diagnostician`
- `documentation` -> `mission_compiler`
- `documentation_agent` -> `mission_compiler`
- `editor` -> `reviewer`
- `editorial_reviewer` -> `reviewer`
- `growth_hacker` -> `creative_copywriter`
- `independent_reviewer` -> `reviewer`
- `marketer` -> `mission_compiler`
- `marketing` -> `mission_compiler`
- `next_mission` -> `mission_compiler`
- `next_mission_generation` -> `mission_compiler`
- `next_mission_generator` -> `mission_compiler`
- `spec_critic` -> `reviewer`
- `writer` -> `creative_copywriter`

### Exemplos JSON
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "megabrain.decompose",
    "arguments": {
      "task": "Synthesize plan",
      "metadata": { "recommended_role": "mission_compiler" }
    }
  }
}
```

```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "megabrain.dispatch_subtask",
    "arguments": {
      "subtask_id": "st-1",
      "role": "implementer"
    }
  }
}
```
## Transportes e autenticação

Três transportes suportados e governança estrita de autenticação:

### 1. Streamable HTTP
- Entrypoint: `POST /mcp`
- Endpoints: `http://127.0.0.1:20130/mcp` (local) e `https://mcp.atlascommand.dev/mcp` (deploy).
- Headers obrigatórios:
  - `Content-Type: application/json`
  - `Accept: application/json, text/event-stream`
  - `Authorization: Bearer <token>`
  - `MCP-Protocol-Version: 2026-07-28`
  - `Mcp-Method: <method>`
  - `Mcp-Name: <name>` (em `tools/call`)
- Objeto `params._meta` obrigatório:
  - `io.modelcontextprotocol/protocolVersion`: `"2026-07-28"`
  - `clientCapabilities`: objeto de capacidades do cliente
  - `clientInfo`: objeto de identificação do cliente

### 2. stdio async
- Entrypoint: `MegaBrainNativeMCPServer.run_stdio_async` para harness local.

### 3. JSON-RPC stdio
- Entrypoint: `run_jsonrpc_stdio`, newline-delimited JSON-RPC 2.0, sem `call_tool` in-process.

### Regras de Autenticação e Segurança
- `Authorization: Bearer <token>` obrigatório para `/mcp`.
- Tokens em query string (`?token=`, `?key=`, `?bearer=`) são rejeitados com HTTP 401.
- Cookies de sessão web (`mb_user_session`, `mb_admin_session`) não autenticam `/mcp`.

### Exemplo curl / JSON-RPC `tools/list`
```bash
curl -X POST https://mcp.atlascommand.dev/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer \${MEGABRAIN_TOKEN}" \
  -H "MCP-Protocol-Version: 2026-07-28" \
  -H "Mcp-Method: tools/list" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{"_meta":{"io.modelcontextprotocol/protocolVersion":"2026-07-28","clientCapabilities":{},"clientInfo":{"name":"megabrain-cli","version":"3.2.0"}}}}'
```
