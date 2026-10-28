# Time-Travel Deterministic Replay

Governs forensic state reconstruction and step-by-step audit replays via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Deterministic Replay Engine (`megabrain_time_travel_replay`)

Reconstructs mission and DAG execution states deterministically from ledger event chains:
- **Sequential Event Sourcing**: Plays event blocks from genesis (`index: 0`) to target checkpoint or timestamp.
- **Forensic DAG Reconstruction**: Restores in-memory task states, wave progression, and intermediate artifacts.
- **Hash-Chain Validation**: Verifies sequential SHA-256 hashes during playback to guarantee event integrity.

## Replay Modes & Forensic Investigation

Forensic analysis supports targeted stepping and divergence diagnostics:
- **Step-by-Step Replay**: Steps through discrete events to inspect state transitions prior to failures.
- **Point-in-Time Reconstruction**: Rebuilds exact DAG dependency graph at any arbitrary timestamp or block index.
- **Divergence Canary**: Compares replay outputs against logged verification hashes to identify non-deterministic behavior.

Facilitates incident post-mortems and cryptographic proofs of correctness for audit and regulatory compliance.

```bash
megabrain call megabrain.time_travel_replay '{"work_id":"work_local_1","target_index":42}'
```

Replay usa JSON objeto, não flags `--work_id`. Cadeia local válida não implica receipt Ed25519 verificado.
