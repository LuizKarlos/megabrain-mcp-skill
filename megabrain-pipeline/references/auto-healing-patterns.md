# Auto-Healing Graph Patterns

Defines dynamic graph recovery and remediation injection via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Dynamic Dependency Healing (`heal_dependency_graph`)

Resolves unblocked or broken graph states during execution:
- **Blockage Diagnosis**: Identifies stalled nodes caused by upstream failure, cancellation, or missing dependencies.
- **Graph Re-wiring**: Safely bypasses non-critical optional branches or rewires downstream dependencies.
- **Topological Integrity**: Validates acyclicity after re-wiring before resuming pipeline execution.

## Remediation Subtask Injection (`synthesize_subtask`)

When a subtask fails deterministic test gates (`verify_subtask`):
1. **Failure Diagnosis**: Captures stderr, exit codes, and diffs to synthesize targeted root-cause context.
2. **Dynamic Injection**: Injects an ephemeral `REMEDIATION` subtask directly into the active wave.
3. **Dependency Re-anchoring**: Automatically routes original downstream dependents to depend on the remediation subtask.
4. **Retry Budgeting**: Bounded to $N$ attempts (default: 2); transitions to fail-closed or skipped on exhaustion.

```bash
megabrain call megabrain.heal_dependency_graph '{"tasks":[{"id":"t1","title":"t1","category":"IMPLEMENTATION","dependencies":["missing_cap"],"status":"BLOCKED"}],"completed_task_ids":[],"failed_task_ids":["t1"],"capability_catalog":{"missing_cap":{"title":"Heal","category":"IMPLEMENTATION","produces":["missing_cap"]}}}'
megabrain call megabrain.synthesize_subtask '{"work_id":"work_local_1","parent_task_id":"t1","new_task":{"id":"t1_heal_missing_cap","title":"Heal","category":"IMPLEMENTATION","dependencies":["t1"]}}'
```

Cura reconhecida e estado terminal. Sem executor o kernel devolve NOT_EXECUTED, nunca SUCCESS falso. Sem execução de provider.
