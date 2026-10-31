---
name: megabrain-review
version: "3.2.0"
description: "Conduct dual-blind peer review, enforce anti-slop humanization patterns, and calibrate author voice and style."
allowed-tools: ["mcp__megabrain__*", "terminal"]
---

# MegaBrain Review

Conduct dual-blind peer reviews, enforce anti-slop humanization patterns, and calibrate author voice via MegaBrain MCP.

## When to Use

- Adjudicating independent multi-reviewer consensus without order bias (`adjudicate_consensus`).
- Scanning and stripping synthetic AI tropes, empty preambles, and clichés (`anti_slop_lint`).
- Calibrating tone, cadence, and vocabulary against canonical author baselines (`voice_calibrate`).
- Computing sentence length variance, structural flow, and rhythm scores (`readability_score`).

## NOT for

- End-to-end mission orchestration or swarm checkpoints (`megabrain-orchestrate`).
- DAG task decomposition, wave scheduling, or graph auto-healing (`megabrain-pipeline`).
- Headless visual TDD, CSS validation, or WCAG accessibility audits (`megabrain-ui`).
- AST context virtualization or minimal package slicing (`megabrain-context`).

## Workflow & CLI

Execute via `megabrain call` com nome qualificado e JSON objeto. O parser rejeita JSON que não seja objeto.

```bash
# 1. Consenso exige reviews com approved, score, verdict, notes e rationale.
# Consenso determinístico não é autorização nem teste GREEN. Sem árbitro LLM server-side.
megabrain call megabrain.adjudicate_consensus '{"task_id":"t1","reviews":[{"reviewer":"rev_a","approved":true,"score":0.9,"verdict":"ACCEPT","notes":"ok","rationale":"gates green"},{"reviewer":"rev_b","approved":true,"score":0.85,"verdict":"ACCEPT","notes":"ok","rationale":"gates green"}]}'

# 2. Anti-slop com JSON objeto, não flags.
megabrain call megabrain.anti_slop_lint '{"text":"Direct assertion without filler."}'

# 3. Voice calibrate com JSON objeto.
megabrain call megabrain.voice_calibrate '{"text":"Output text","author_sample":"Canonical author sample"}'

# 4. Readability com JSON objeto.
megabrain call megabrain.readability_score '{"text":"Technical document content"}'
```

## Quality Rules & Consensus Criteria

- **Consensus Threshold**: Score ponderado é métrica; não autoriza merge, commit ou teste GREEN.
- **No Server Arbiter**: Sem terceiro árbitro LLM automático. Jev é só advisory (`advisory_only=true`).
- **Zero AI Slop**: Strip sycophantic openers, hyperbolic adjectives, and passive hedges. Enforce direct assertions.
- **Review Invariants**: Consenso exige reviews com reviewer, approved, score, verdict, notes e rationale; sem árbitro LLM server-side.

## References

- Dual-blind consensus adjudication: [references/dual-blind-adjudication.md](references/dual-blind-adjudication.md)
- Anti-slop and humanization patterns: [references/anti-slop-patterns.md](references/anti-slop-patterns.md)
- Voice calibration and cadence engineering: [references/voice-calibration.md](references/voice-calibration.md)
