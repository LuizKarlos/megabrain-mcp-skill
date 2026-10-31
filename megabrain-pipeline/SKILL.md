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

Execute via `megabrain call` com nome qualificado e JSON objeto. O parser rejeita JSON que não seja objeto.

```bash
# 1. Decompose: prompt obrigatório; tasks opcional. Sem profundidade máxima.
megabrain call megabrain.decompose '{"prompt":"Analyze local DAG","tasks":[{"id":"t1","title":"plan","category":"PLANNING","dependencies":[]}]}'

# 2. Waves a partir do work_id já criado. Mock/parser não é prova live.
megabrain call megabrain.get_parallel_waves '{"work_id":"work_local_1"}'

# 3. execute_pipeline exige test_commands verificados pelo harness. Sem índice de wave. Sem provider.
megabrain call megabrain.execute_pipeline '{"work_id":"work_local_1","test_commands":{"t1":{"command":"node --test tests/issue351_docs_pipeline.test.js"}},"auto_heal":false}'

# 4. heal usa tasks/catálogo. Cura reconhecida e estado terminal. Sem execução de provider.
megabrain call megabrain.heal_dependency_graph '{"tasks":[{"id":"t1","title":"t1","category":"IMPLEMENTATION","dependencies":["missing_cap"],"status":"BLOCKED"}],"completed_task_ids":[],"failed_task_ids":["t1"],"capability_catalog":{"missing_cap":{"title":"Heal","category":"IMPLEMENTATION","produces":["missing_cap"]}}}'

# 5. synthesize_subtask cria subtask vinculada a parent_task_id com dependências.
megabrain call megabrain.synthesize_subtask '{"work_id":"work_local_1","parent_task_id":"t1","new_task":{"id":"t1_heal_missing_cap","title":"Heal","category":"IMPLEMENTATION","dependencies":["t1"]}}'
```

## UX & Fault Tolerance Rules

- **Path Isolation**: Concurrent wave tasks must operate on mutually exclusive file paths.
- **Fail-Closed on Cycles**: Abort immediately if cyclic dependencies or graph deadlocks occur.
- **Bounded Healing**: Cap auto-healing retries (default: 2) before fail-closed escalation.

## References

- DAG decomposition rules: [references/dag-decomposition-rules.md](references/dag-decomposition-rules.md)
- Topological wave partitioning: [references/topological-waves.md](references/topological-waves.md)
- Auto-healing graph patterns: [references/auto-healing-patterns.md](references/auto-healing-patterns.md)
