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
