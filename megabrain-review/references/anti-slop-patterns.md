# Anti-Slop & Humanization Patterns

Enforces direct, humanized communication and removes synthetic AI tropes via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Automated Linting Protocol (`megabrain.anti_slop_lint`)

Scans text against humanizer heuristics to eliminate conversational fluff, clichés, and superficial verbosity:
- **Preamble Pruning**: Strips sycophantic openers ("Certamente!", "Com certeza!", "Como um modelo de IA...").
- **Cliché Expulsion**: Detects and bans tired metaphors ("mergulhar em", "testamento a", "divisor de águas", "crucial").
- **Flourish Elimination**: Replaces decorative filler with concise, factual, and actionable statements.
- **Redundancy Compression**: Collapses repetitive restatements into single declarative truths.

## Enforcement Rules & Replacements

| Pattern Category | AI Slop Cliché | Humanized Canonical Form |
| :--- | :--- | :--- |
| **Empty Openers** | *"Certamente! Ficarei feliz em ajudar com..."* | *(Direct action or code immediately)* |
| **Inflated Adjectives**| *"É crucial lembrar que a arquitetura robusta..."* | *"A arquitetura exige..."* |
| **Trope Metaphors** | *"Vamos mergulhar profundamente nesta análise..."* | *"Analisando os seguintes pontos:"* |
| **Hedging Fillers** | *"É importante notar que isto serve como um testamento..."* | *"Isto demonstra que..."* |

```bash
megabrain call megabrain.anti_slop_lint '{"text":"Direct assertion without filler."}'
```

JSON objeto, não flags `--text`.
