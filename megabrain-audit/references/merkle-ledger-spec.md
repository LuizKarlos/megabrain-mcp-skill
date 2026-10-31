# Merkle Ledger & Evidence Pack Specification

Governs immutable cryptographic event recording via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Ledger Architecture (`export_audit_ledger`, `export_evidence_pack`)

Enforces append-only cryptographic provenance for mission lifecycles and DAG state transitions:
- **Audit Ledger (`export_audit_ledger`)**: Sequential SHA-256 hash chain verifying state sequence integrity.
- **Evidence Pack (`export_evidence_pack`)**: Self-contained bundle with ledger blocks, receipts, and execution artifacts.
- **Tamper Detection**: Any modification to historical block contents invalidates downstream hash links.

## SHA-256 Block Schema

Each ledger entry adheres to the canonical block structure:
- `index`: Monotonically increasing sequence integer (`uint64`).
- `previous_hash`: Hex-encoded SHA-256 digest of preceding block (`"0"` for genesis).
- `timestamp`: ISO-8601 UTC string recording exact transition time.
- `event_type`: Categorical identifier (`TASK_DISPATCHED`, `VERIFICATION_GATE`, etc.).
- `data`: Canonical serialized JSON object containing event context and assertions.
- `hash`: SHA-256 digest over `canonical_json({index, previous_hash, timestamp, event_type, data})`.

```bash
megabrain call megabrain.export_audit_ledger '{"work_id":"work_local_1"}'
megabrain call megabrain.export_evidence_pack '{"work_id":"work_local_1"}'
node scripts/merkle_verify.js ledger.json
```

scripts/merkle_verify.js verifica somente a cadeia local. Export Merkle/Ed25519 soberano é export_audit_ledger / export_evidence_pack. Sem chave válida o kernel falha fechado. Referência não é assinatura verificada.
