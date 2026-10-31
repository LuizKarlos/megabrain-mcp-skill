---
name: megabrain-orchestrate
version: "3.2.0"
description: "Orchestrate autonomous multi-agent missions, manage checkpoints, and coordinate swarm execution via MegaBrain MCP."
allowed-tools: ["mcp__megabrain__*", "terminal"]
---

# MegaBrain Orchestrate

Orchestrate end-to-end missions, autonomous swarms, and checkpoint rollbacks via MegaBrain MCP.

## When to Use

- Executing end-to-end sovereign missions across multi-phase tasks.
- Coordinating autonomous multi-agent swarms with bounded resource budgets.
- Capturing atomic state snapshots (`checkpoints`) before high-risk mutations.
- Reverting failed or regressed mission states deterministically (`rollback`).

## NOT for

- AST slicing or syntax graph extraction (`megabrain-context`).
- WCAG accessibility or visual TDD audits (`megabrain-ui`).
- Isolated forensic ledger verification (`megabrain-audit`).
- Single-wave pipeline scheduling (`megabrain-pipeline`).

## Workflow & CLI

Execute via `megabrain call` com nome qualificado e JSON objeto. O parser rejeita JSON que não seja objeto.

```bash
# 1. Orchestrate: prompt, idempotency_key e workspace_root são obrigatórios.
# finalize_mode=commit não publica PR/merge. Sem evidence_bundle o kernel bloqueia IMPLEMENTATION com INSUFFICIENT_EVIDENCE.
megabrain call megabrain.orchestrate '{"prompt":"Analyze local contract","idempotency_key":"idemp-local-1","workspace_root":"/tmp/mb-orch-fixture","finalize_mode":"commit"}'

# 2. Swarm: mission + evidence_bundle. Sem evidence_bundle o status é INSUFFICIENT_EVIDENCE, não SUCCESS.
# Sem executor o kernel devolve NOT_EXECUTED; o CLI não envia callable JSON.
megabrain call megabrain.coordinate_mission_swarm '{"mission":{"title":"local","tasks":[{"id":"t1","dependencies":[]}]},"evidence_bundle":{"files":[]}}'

# 3. Checkpoint / rollback usam work_id real já criado.
megabrain call megabrain.create_checkpoint '{"work_id":"work_local_1","label":"pre-mutation"}'
megabrain call megabrain.rollback_checkpoint '{"work_id":"work_local_1","checkpoint_id":"pre-mutation"}'
```

## UX & Operational Rules

- **Anti-Context-Dumping**: Dispatch minimal context packets (pacotes mínimos delimitados). Never dump full workspace trees.
- **Structured Communication**: Return concise status summaries with work IDs, checkpoint hashes, and gate results.

## References

- Mission lifecycle & transitions: [references/mission-lifecycle.md](references/mission-lifecycle.md)
- Swarm coordination & arbitration: [references/swarm-coordination.md](references/swarm-coordination.md)
