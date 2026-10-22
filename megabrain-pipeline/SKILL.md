---
name: megabrain-pipeline
version: "3.2.0"
description: "Decompose complex tasks into directed acyclic graphs (DAG), execute topological waves, and manage dependency auto-healing."
allowed-tools: ["mcp__megabrain__*", "terminal"]
---

# MegaBrain Pipeline

Decompose tasks into DAGs, execute topological waves, and auto-heal execution dependencies via MegaBrain MCP.

## When to Use

- Decomposing complex tasks into granular, acyclic subtask graphs (`decompose`).
- Partitioning subtasks into concurrent execution waves via Kahn's algorithm (`get_parallel_waves`).
- Scheduling and executing sovereign wave pipelines across subtasks (`execute_pipeline`).
- Diagnosing graph blockages and dynamic dependency auto-healing (`heal_dependency_graph`).

## NOT for

- End-to-end sovereign mission orchestration or swarm checkpoints (`megabrain-orchestrate`).
- Multi-reviewer consensus, anti-slop linting, or voice calibration (`megabrain-review`).
- Headless visual TDD, CSS validation, or WCAG accessibility audits (`megabrain-ui`).

## Workflow & CLI

Execute via `megabrain call` or `npx @megabrain/cli call`:

```bash
# 1. Decompose task into DAG
megabrain call decompose '{"task": "Implement feature", "max_depth": 3}'

# 2. Validate DAG acyclicity and compute waves
node scripts/dag_validator.js tasks.json
megabrain call get_parallel_waves '{"work_id": "wrk_01"}'

# 3. Execute pipeline wave
megabrain call execute_pipeline '{"work_id": "wrk_01", "wave_index": 0}'

# 4. Auto-heal blocked dependencies on failure
megabrain call heal_dependency_graph '{"work_id": "wrk_01"}'
```

## UX & Fault Tolerance Rules

- **Path Isolation**: Concurrent wave tasks must operate on mutually exclusive file paths.
- **Fail-Closed on Cycles**: Abort immediately if cyclic dependencies or graph deadlocks occur.
- **Bounded Healing**: Cap auto-healing retries (default: 2) before fail-closed escalation.

## References

- DAG decomposition rules: [references/dag-decomposition-rules.md](references/dag-decomposition-rules.md)
- Topological wave partitioning: [references/topological-waves.md](references/topological-waves.md)
- Auto-healing graph patterns: [references/auto-healing-patterns.md](references/auto-healing-patterns.md)
