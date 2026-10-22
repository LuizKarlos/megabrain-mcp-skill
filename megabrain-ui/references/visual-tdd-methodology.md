# Visual TDD Methodology Specification

Governs headless visual test-driven development and layout verification via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Headless Visual TDD Lifecycle

Enforces deterministic RED-GREEN cycles before and during UI implementation:
- **RED Gate**: Author visual assertions against target DOM nodes, layout geometries, and accessibility tree before HTML/CSS changes.
- **Visual Capture (`megabrain_playwright_capture`)**: Renders DOM in headless browser, producing pixel-accurate snapshots, bounding boxes, and computed styles.
- **Deterministic Assertion (`megabrain_summarize_visual_tdd`)**: Mechanically validates 100% pass criteria across contrast, typography, spacing, and DOM hierarchy.
- **GREEN Verification**: Code passes only when violations reach zero (`violations_count == 0`, `status == "pass"`).

## Structural & Layout Assertions

- **DOM Hierarchy**: Validates heading sequences (`h1` -> `h2` -> `h3`) and accessible names (`aria-label`, visible text).
- **Inline Style Isolation**: Forbids uncoordinated inline colors (`style="color:..."`) to avoid background fallback false-positives.
- **Layout Invariance**: Enforces responsive container boundaries and viewport scaling determinism.

```bash
megabrain call playwright_capture --url "http://localhost:3000" --viewport '{"width":1280,"height":800}'
megabrain call summarize_visual_tdd --html "index.html" --css "styles.css"
```
