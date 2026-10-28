# Dual-Blind Review Adjudication

Governs multi-reviewer consensus and blind arbitration via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Dual-Blind Consensus Protocol (`megabrain.adjudicate_consensus`)

Cross-evaluates independent reviewers to eliminate order bias and model seniority skew:
- **Blind Isolation**: Reviewers evaluate artifacts independently without observing peer votes.
- **Order-Independent Adjudication**: Review payloads are sorted deterministically by hash before scoring.
- **Consensus Threshold**: Weighted agreement threshold (default $\ge 0.80$) required for consensus; consensus is not authorization.

## Scoring Matrix & Blind Tie-Breakers

Evaluates code, architecture, and documentation against four orthogonal dimensions:
1. **Correctness & Contract Conformance** (weight: 0.40): Adherence to schema and GREEN test gates.
2. **Security & Boundary Safety** (weight: 0.30): Input sanitization and least-privilege scoping.
3. **Maintainability & Modularity** (weight: 0.15): Minimal diffs and low cognitive complexity.
4. **Performance & Resource Footprint** (weight: 0.15): Algorithmic efficiency and non-blocking I/O.

When reviewer scores diverge beyond standard tolerance ($\Delta > 0.25$), nenhum árbitro LLM server-side é despachado automaticamente; a divergência permanece evidência para o orquestrador.

```bash
megabrain call megabrain.adjudicate_consensus '{"task_id":"t1","reviews":[{"reviewer":"rev_a","approved":true,"score":0.9,"verdict":"ACCEPT","notes":"ok","rationale":"gates green"}]}'
```

Campo `approved` é obrigatório. Consenso determinístico não é autorização nem teste GREEN. Sem árbitro LLM server-side. Jev é só advisory.
