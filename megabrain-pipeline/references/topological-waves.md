# Topological Wave Partitioning

Defines topological wave execution and path isolation algorithms via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Partitioning Algorithm (Kahn's In-Degree)

Topological waves group mutually independent tasks into concurrent execution batches:
1. **In-Degree Calculation**: Count unresolved incoming dependencies (`in_degree`) per task.
2. **Wave Extraction**: Collect all tasks where `in_degree == 0` into the current wave.
3. **Graph Reduction**: Concurrently execute current wave; upon completion, decrement dependent `in_degree` counts.
4. **Iterative Progression**: Repeat until all nodes are resolved or fail-closed if cycle detected.

## Parallel Execution and Path Isolation

- **Independent Concurrency**: Subtasks within a wave run in parallel with disjoint agent sessions.
- **Path Isolation**: Concurrent subtasks must operate on mutually exclusive file paths to prevent race conditions.
- **Lock Enforcement**: Exclusive path locks are arbitrated via `arbitrate_concurrency` before wave execution.

## Execution via CLI

```bash
megabrain call megabrain.get_parallel_waves '{"work_id":"work_local_1"}'
megabrain call megabrain.execute_pipeline '{"work_id":"work_local_1","test_commands":{"t1":{"command":"node --test tests/issue351_docs_pipeline.test.js"}}}'
```

`execute_pipeline` exige `test_commands` verificados pelo harness. Sem `wave_index`. Sem provider.
