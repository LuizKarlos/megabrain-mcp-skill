# DAG Decomposition Rules

Governs task decomposition into directed acyclic graphs via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Core Decomposition Principles

1. **Atomic Decomposition**:
   - Every complex mission decomposes into granular, non-overlapping subtasks (`PLANNING`, `IMPLEMENTATION`, `TESTING`, `INTEGRATION`).
   - Subtasks must produce discrete, testable deliverables with bounded file diffs.
2. **Single Responsibility Scope**:
   - Each subtask focuses strictly on one responsibility (e.g., single component, test suite, or schema).
   - Context is bounded to immediate dependencies to avoid token bloat and drift.
3. **Strict Explicit Dependencies**:
   - `depends_on` lists exact prerequisite task IDs; implicit ordering is forbidden.
   - Dependency graphs must be strictly acyclic; cycles trigger immediate validation failure.

## Verification and Tooling

Validate task graphs prior to dispatch using `@megabrain/cli`:

```bash
megabrain call decompose --task "Implement feature"
node scripts/dag_validator.js tasks.json
```
