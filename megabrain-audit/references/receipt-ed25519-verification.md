# Ed25519 Cryptographic Verification Receipts

Governs asymmetric attestation and non-repudiation for verification receipts via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Asymmetric Attestation Protocol

Every verified subtask output is sealed with an asymmetric cryptographic signature:
- **Keypair Roles**: The orchestrator holds a private Ed25519 signing key; verifier instances register trusted public keys.
- **Receipt Attestation**: Verification receipts sign canonical summaries of task execution (`work_id`, `task_id`, `test_result`).
- **Tamper Invariance**: Signatures provide non-repudiation and prevent forgery or retro-fitted test passes.

## Receipt Envelope & Verification Flow

Verification receipts encapsulate signature metadata within a canonical envelope:
- `signer_id`: Public identity or URI of signing authority (`urn:megabrain:verifier:prod`).
- `public_key`: Hex/Base64 Ed25519 public key corresponding to signing identity.
- `payload_hash`: SHA-256 digest of the canonical verification receipt body.
- `signature`: 64-byte Ed25519 signature generated over `payload_hash`.

Consumers validate signatures offline or at runtime prior to merging code or advancing pipeline waves.

```bash
megabrain call verify_subtask --work_id "wrk_01" --task_id "tsk_01" --test_result '{"status":"GREEN","exit_code":0}'
```
