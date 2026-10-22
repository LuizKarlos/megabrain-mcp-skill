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

Execute via `megabrain call` or `npx @megabrain/cli call`:

```bash
# 1. Orchestrate sovereign mission
megabrain call orchestrate '{"task": "Implement feature", "budget_tokens": 50000}'

# 2. Coordinate multi-agent swarm across topological waves
megabrain call coordinate_mission_swarm '{"work_id": "wrk_01", "max_concurrency": 4}'

# 3. Create pre-mutation checkpoint
megabrain call create_checkpoint '{"work_id": "wrk_01", "label": "pre-mutation"}'

# 4. Rollback to checkpoint on failure
megabrain call rollback_checkpoint '{"work_id": "wrk_01", "checkpoint_id": "chk_01"}'
```

## UX & Operational Rules

- **Anti-Context-Dumping**: Dispatch minimal context packets (<3,000 tokens). Never dump full workspace trees.
- **Structured Communication**: Return concise status summaries with work IDs, checkpoint hashes, and gate results.

## References

- Mission lifecycle & transitions: [references/mission-lifecycle.md](references/mission-lifecycle.md)
- Swarm coordination & arbitration: [references/swarm-coordination.md](references/swarm-coordination.md)
