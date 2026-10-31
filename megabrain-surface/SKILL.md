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
