---
name: megabrain-audit
version: "3.2.0"
description: "Export Merkle audit ledgers, verify Ed25519 cryptographic receipts, and execute deterministic time-travel replays."
allowed-tools: ["mcp__megabrain__*", "terminal"]
---

# MegaBrain Audit

Export Merkle audit ledgers, verify Ed25519 cryptographic receipts, and execute deterministic replays via MegaBrain MCP.

## When to Use

- Exporting SHA-256 chained audit ledgers (`export_audit_ledger`).
- Packaging verifiable evidence bundles with artifacts and receipts (`export_evidence_pack`).
- Verifying asymmetric Ed25519 receipts for subtask execution gates (`verify_subtask`).
- Executing deterministic forensic time-travel replays across state transitions (`time_travel_replay`).
- Validating offline ledger block integrity via `scripts/merkle_verify.js`.

## NOT for

- End-to-end sovereign mission orchestration or swarm checkpoints (`megabrain-orchestrate`).
- DAG task decomposition, topological wave scheduling, or graph auto-healing (`megabrain-pipeline`).
- Headless visual TDD, CSS validation, or WCAG accessibility audits (`megabrain-ui`).

## Workflow & CLI

Execute via `megabrain call` com nome qualificado e JSON objeto. O parser rejeita JSON que não seja objeto.

```bash
# 1. Export soberano do ledger. Sem chave válida o kernel falha fechado.
megabrain call megabrain.export_audit_ledger '{"work_id":"work_local_1"}'

# 2. merkle_verify.js verifica SOMENTE a cadeia local SHA-256. Não verifica Ed25519 nem root soberano.
# Referência/arquivo local não é assinatura verificada.
node scripts/merkle_verify.js ledger.json

# 3. Evidence pack soberano com receipts. Mock/parser não é prova live.
megabrain call megabrain.export_evidence_pack '{"work_id":"work_local_1"}'

# 4. Replay usa JSON objeto, não flags. Envelope/receipts/replay seguem o schema real.
megabrain call megabrain.time_travel_replay '{"work_id":"work_local_1","target_index":42}'
```

## Cryptographic Invariants & Audit Guarantees

- **Hash Chain Continuity**: Each block enforces `hash == SHA-256(canonical_json(block - hash))` and links to `previous_hash`.
- **Non-Repudiation**: Verification receipts require valid Ed25519 signatures from trusted verifier keys.
- **Fail-Closed Verification**: Any hash divergence, malformed payload, or broken link halts downstream validation.

## References

- Merkle ledger specification: [references/merkle-ledger-spec.md](references/merkle-ledger-spec.md)
- Ed25519 receipt verification: [references/receipt-ed25519-verification.md](references/receipt-ed25519-verification.md)
- Time-travel deterministic replay: [references/time-travel-replay.md](references/time-travel-replay.md)
