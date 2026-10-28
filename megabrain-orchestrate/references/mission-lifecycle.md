# Mission Lifecycle Specification

Governs mission state transitions and atomic checkpointing in MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`) via `@megabrain/cli`.

## Lifecycle States

- **INIT**: Task intake and contract refinement (`refine_prompt`). WorkRecord instantiated with DAG.
- **RUNNING**: Topological waves executing subtasks concurrently with GREEN test gates.
- **CHECKPOINT**: Execution paused to persist immutable state snapshot before risky mutations.
- **COMPLETED**: All subtasks verified GREEN (`verify_subtask`) and Merkle ledger exported.
- **FAILED**: Unrecoverable regression or exhausted remediations; triggers fail-closed state.

```
INIT ──> RUNNING ──┬──> CHECKPOINT ──> RUNNING
                   ├──> COMPLETED (all gates GREEN)
                   └──> FAILED (unrecoverable / budget exhausted)
```

## Checkpoint & Rollback Protocol

1. **Snapshot (`megabrain.create_checkpoint`)**:
   - Takes `work_id` and optional `label`.
   - Serializes atomic snapshot of `WorkRecord` (DAG, task outputs, event log).
   - Returns immutable `checkpoint_id`.
2. **Rollback (`megabrain.rollback_checkpoint`)**:
   - Takes `work_id` and `checkpoint_id`.
   - Deterministically restores `WorkRecord` to snapshot and releases acquired locks.
   - Appends signed rollback event to audit ledger.

```bash
megabrain call megabrain.create_checkpoint '{"work_id":"work_local_1","label":"pre-patch"}'
megabrain call megabrain.rollback_checkpoint '{"work_id":"work_local_1","checkpoint_id":"pre-patch"}'
```

`orchestrate` exige `prompt`, `idempotency_key` e `workspace_root`. Mock/parser não é prova live. Sem checkpoint persistido, `inspect` devolve MISSION_NOT_FOUND.
