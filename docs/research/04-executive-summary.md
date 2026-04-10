# Executive Summary: Claude Code & AI IDE Ecosystem Research

**Research Date:** April 9, 2026
**Methodology:** Modified TOPSIS + Bayesian Average Smoothing

---

## Document Index

| File | Contents |
|------|----------|
| [00-ranking-methodology.md](./00-ranking-methodology.md) | TOPSIS + Bayesian scoring system design |
| [01-claude-code-top-3-problems.md](./01-claude-code-top-3-problems.md) | Top 3 problems with detailed community solutions |
| [02-claude-code-top-10-plugins.md](./02-claude-code-top-10-plugins.md) | Top 10 Claude Code plugins with install metrics |
| [03-antigravity-vscode-top-5.md](./03-antigravity-vscode-top-5.md) | Top 5 AI extensions for Google Antigravity / VS Code |

---

## Quick Reference: Top 3 Claude Code Problems

| # | Problem | Severity | Best Workaround |
|---|---------|----------|-----------------|
| 1 | **Performance Regression** -- Thinking depth cut 67%, blind edits up 5.4x | Critical | `MAX_THINKING_TOKENS=63999 claude` + session chunking every 30-45 min |
| 2 | **Rate Limiting / Token Drain** -- Sessions burning out in 19 min | Severe | TeamoRouter for cheap-model routing + `/model sonnet` for non-complex tasks |
| 3 | **Memory Loss Across Sessions** -- Fresh context every session | Significant | Structured CLAUDE.md (<200 lines) + CodeSyncer + manual session handoff protocol |

---

## Quick Reference: Top 10 Claude Code Plugins

| # | Plugin | Creator | Installs | One-Line Summary |
|---|--------|---------|----------|-----------------|
| 1 | **Frontend Design** | Anthropic | 455K | Kills "AI slop" UI with distinctive design |
| 2 | **Superpowers** | obra | 356K | TDD-enforced dev methodology (42K GitHub stars) |
| 3 | **Context7** | Upstash | 231K | Live docs injection, kills hallucinated APIs |
| 4 | **Code Review** | Anthropic | 213K | 5 parallel review agents, confidence scoring |
| 5 | **Playwright MCP** | Microsoft | 150K | Browser automation via accessibility trees |
| 6 | **GitHub MCP** | GitHub | 173K | Foundational GitHub integration |
| 7 | **Security Guidance** | Anthropic | 108K | Auto-scans edits for OWASP vulns (4.2x growth in 3 mo) |
| 8 | **Firecrawl** | Mendable | N/A | Web-to-LLM markdown (40K GitHub stars) |
| 9 | **Skill Creator** | Anthropic | 132K | Meta-plugin: builds and benchmarks other plugins |
| 10 | **Chrome DevTools MCP** | Google | 21K | Full DevTools access, 40% debug time reduction |

---

## Quick Reference: Top 5 Google Antigravity / VS Code Extensions

| # | Extension | Installs | Rating | One-Line Summary |
|---|-----------|----------|--------|-----------------|
| 1 | **GitHub Copilot** | 72.8M | 4.0/5 | Dominant leader; Agent Mode GA; broadest model access |
| 2 | **Claude Code for VS Code** | 9.7M | 4.0/5 | Deep reasoning; daily updates; MCP ecosystem |
| 3 | **Cline** | 3.6M | 4.0/5 | Fastest-growing OSS (4,704% YoY); BYOK; checkpoints |
| 4 | **Roo Code** | 1.5M | 5.0/5 | Highest user satisfaction; multi-mode agents; SOC 2 |
| 5 | **Continue** | 2.6M | 3.5/5 | Most flexible (any model incl. local); Apache 2.0 |

---

## Key Takeaways

### Claude Code Ecosystem
- The plugin ecosystem exploded from launch (March 7, 2026) to **9,000+ plugins** in one month
- Anthropic dominates the top 10 (6 of 10 plugins are Anthropic-built)
- **All top plugins are free** -- the ecosystem is commoditizing
- The performance regression (Problem #1) is the most severe and well-documented issue in Claude Code history, with AMD's AI Director providing 234,760 tool calls of evidence

### Google Antigravity
- A VS Code fork with **agent-first architecture** (16 built-in agents via AgentKit 2.0)
- Free tier includes Gemini 3 Pro, Claude Sonnet 4.6, and GPT-OSS
- Extension ecosystem is nascent (~5 months old); real value is built-in agents
- Most VS Code extensions work via `.vsix` install, but Microsoft-licensed extensions are blocked

### VS Code AI Extensions
- **Copilot dominates** (72.8M installs) but the market is bifurcating into completion tools vs agentic tools
- **Agentic tools** (Cline, Roo Code, Continue) are the fastest-growing category
- **Roo Code** has the highest user satisfaction (5/5 from 339 reviews)
- **All top 5 are free or freemium** -- AI coding assistance is rapidly commoditizing

---

*Full details, metrics, workarounds, and sources in the individual documents linked above.*
