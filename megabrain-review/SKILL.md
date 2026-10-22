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

Execute via `megabrain call` or `npx @megabrain/cli call`:

```bash
# 1. Adjudicate dual-blind reviewer consensus
megabrain call adjudicate_consensus '{"task_id": "tsk_01", "reviews": [{"reviewer": "rev_a", "score": 0.9, "verdict": "ACCEPT"}, {"reviewer": "rev_b", "score": 0.85, "verdict": "ACCEPT"}]}'

# 2. Scan and remove synthetic AI slop patterns
megabrain call anti_slop_lint '{"text": "Certamente! É crucial mergulhar fundo nesta solução robusta."}'

# 3. Calibrate generated text against canonical author voice
megabrain call voice_calibrate '{"text": "Output text", "author_sample": "Canonical author sample"}'

# 4. Measure syntactic rhythm and readability metrics
megabrain call readability_score '{"text": "Technical document content"}'
```

## Quality Rules & Consensus Criteria

- **Consensus Threshold**: Require weighted score >= 0.80 across independent reviewers for automatic approval.
- **Blind Arbitration**: Dispatch a third-party arbiter when reviewer scores diverge (delta > 0.25).
- **Zero AI Slop**: Strip sycophantic openers, hyperbolic adjectives, and passive hedges. Enforce direct assertions.

## References

- Dual-blind consensus adjudication: [references/dual-blind-adjudication.md](references/dual-blind-adjudication.md)
- Anti-slop and humanization patterns: [references/anti-slop-patterns.md](references/anti-slop-patterns.md)
- Voice calibration and cadence engineering: [references/voice-calibration.md](references/voice-calibration.md)
