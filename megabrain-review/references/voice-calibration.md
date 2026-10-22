# Voice Calibration & Cadence Engineering

Aligns generated documentation and code artifacts with canonical author style via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Stylistic Alignment (`megabrain_voice_calibrate`)

Compares generated drafts against gold-standard author samples to preserve authentic developer voice:
- **Tone Matching**: Ensures declarative, confident, and direct delivery without passive softening.
- **Vocabulary Calibration**: Prioritizes concise domain terminology over generic marketing jargon.
- **Cadence Scoring**: Measures semantic similarity and density against canonical author baselines.

## Rhythm & Readability Metrics (`megabrain_readability_score`)

Monitors syntactic and structural flow to avoid robotic monotony:
- **Sentence Length Variance ($\sigma^2$)**: Alternates short punchy assertions with explanatory compound clauses.
- **Structural Rhythm**: Balances prose paragraphs with structured markdown tables and bulleted constraints.
- **Assertive Vocabulary Index**: Penalizes weak hedges ("talvez", "possivelmente", "parece que") in favor of definitive statements.

```bash
megabrain call voice_calibrate --text "Output text" --author_sample "Canonical text sample"
megabrain call readability_score --text "Technical document content"
```
