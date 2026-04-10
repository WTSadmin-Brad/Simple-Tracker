# Top 10 Claude Code Plugins/Extensions

**Research Date:** April 9, 2026
**Ranking Method:** Modified TOPSIS with Bayesian Smoothing (see 00-ranking-methodology.md)

---

## Ecosystem Context

- **101 official plugins** in Anthropic's marketplace (33 Anthropic-built, 68 partner)
- **9,000+ total plugins** across ClaudePluginHub, Claude-Plugins.dev, and the Anthropic Marketplace
- **Plugin marketplace launched:** March 7, 2026, with GitLab, Replit, Harvey, Snowflake as partners
- **Plugin install command:** `/plugin install <name>@<marketplace>`

---

## TOPSIS Ranking Results

| Rank | Plugin | Creator | Installs | TOPSIS CC | Key Strength |
|------|--------|---------|----------|-----------|--------------|
| 1 | Frontend Design | Anthropic | 455,628 | 0.89 | Highest adoption + strong momentum |
| 2 | Superpowers | obra (Jesse Vincent) | 355,657 | 0.85 | Community champion, 42K GitHub stars |
| 3 | Context7 | Upstash | 231,346 | 0.78 | Solves hallucination problem directly |
| 4 | Code Review | Anthropic | 212,871 | 0.76 | Multi-agent PR review, used internally at Anthropic |
| 5 | Playwright MCP | Microsoft | 150,132 | 0.73 | Browser automation, 30K GitHub stars |
| 6 | GitHub MCP Server | GitHub | 172,828 | 0.71 | Foundational integration for all dev workflows |
| 7 | Security Guidance | Anthropic | 107,637 | 0.68 | Fastest growth rate (4x in 3 months) |
| 8 | Firecrawl | Mendable Inc. | N/A | 0.65 | 40K GitHub stars, web scraping standard |
| 9 | Skill Creator | Anthropic | 131,592 | 0.63 | Meta-plugin: builds other plugins |
| 10 | Chrome DevTools MCP | Google | 20,829 | 0.59 | 40% debugging time reduction, unique capability |

---

## #1: Frontend Design

**TOPSIS Score: 0.89** | **Installs: 455,628** | **Creator: Anthropic (Verified)**

### What It Does
Generates production-grade frontend interfaces with distinctive design. Automatically activates when users ask Claude to build frontend components. The skill is ~400 tokens of guidance that pushes Claude toward:
- Distinctive typography over safe defaults
- Dominant colors with sharp accents over timid palettes
- Atmospheric depth over flat backgrounds
- Asymmetric composition over predictable grids

### Why #1
- Highest install count of any Claude Code plugin
- Solves the #1 aesthetic complaint about AI-generated UI ("AI slop")
- Featured on paddo.dev, Builder.io, Snyk, and multiple publications
- Free, included in official marketplace

**Install:** `/plugin install frontend-design@claude-plugins-official`

---

## #2: Superpowers

**TOPSIS Score: 0.85** | **Installs: 355,657** | **GitHub Stars: ~42,000** | **Creator: Jesse Vincent (obra)**

### What It Does
Comprehensive agentic development methodology. Enforces TDD (red-green-refactor), systematic debugging with root cause investigation, Socratic brainstorming, and subagent-driven development with built-in code review. If Claude writes code before tests, the plugin **automatically deletes it** and forces restart with tests first.

### Why #2
- Highest-installed non-Anthropic plugin
- 42K GitHub stars -- massive community validation
- Has its own marketplace (`obra/superpowers-marketplace`)
- Builder.io wrote a dedicated guide calling it "the structured workflow that actually works"
- Described as turning Claude Code into "a real senior developer"
- Free, open source (MIT)

**Install:** `/plugin install superpowers@superpowers-marketplace`

---

## #3: Context7

**TOPSIS Score: 0.78** | **Installs: 231,346** | **Creator: Upstash**

### What It Does
MCP server that delivers up-to-date, version-specific documentation directly into prompts. Two core tools:
- `resolve-library-id`: Matches library names to Context7 IDs
- `query-docs`: Fetches current docs from source repos

Solves the problem of hallucinated APIs and deprecated code patterns by pulling current documentation straight from source repositories.

### Why #3
- Directly addresses one of the most frustrating LLM problems (outdated training data)
- Recommended across multiple "best plugins" lists (Firecrawl, Composio, ClaudeFast)
- Includes automated skills, documentation research agents, and custom commands
- Auto-triggers when Claude detects documentation would be helpful
- Free, open source

**Install:** `/plugin marketplace add upstash/context7` then `/plugin install context7-plugin@context7-marketplace`

---

## #4: Code Review

**TOPSIS Score: 0.76** | **Installs: 212,871** | **Creator: Anthropic (Verified)**

### What It Does
Multi-agent automated PR code review. Deploys **5 independent reviewer agents in parallel:**
1. CLAUDE.md compliance checking
2. Bug detection
3. Git history context analysis
4. Previous PR comment review
5. Code comment verification

Each finding scored 0-100 confidence; only issues scoring 80+ are posted.

### Why #4
- Used internally at Anthropic before public release
- Launched March 9, 2026; covered by TechCrunch and The New Stack
- Addresses the flood of AI-generated code needing review
- Free (Team/Enterprise plans for full features)

**Install:** `/plugin install code-review@claude-plugins-official`

**Usage:** `/code-review` (local terminal output) or `/code-review --comment` (posts to PR)

---

## #5: Playwright MCP

**TOPSIS Score: 0.73** | **Installs: 150,132** | **GitHub Stars: 30,300** | **Creator: Microsoft**

### What It Does
Browser automation and end-to-end testing through MCP. Claude can:
- Navigate URLs, take screenshots, click elements, fill forms
- Handle file uploads, browser dialogs
- Generate PDFs, run custom Playwright scripts
- Manage tabs, inspect networks, read console messages

Uses **accessibility trees** instead of vision models for deterministic, reliable interactions.

### Why #5
- Called "the most transformative MCP for web developers" (Firecrawl blog)
- Works across Chromium, Firefox, and WebKit
- 30K GitHub stars -- massive open source community
- Featured by Simon Willison, Builder.io, and testomat.io
- Free, open source

**Install:** `/plugin install playwright@claude-plugins-official`

---

## #6: GitHub MCP Server

**TOPSIS Score: 0.71** | **Installs: 172,828** | **Creator: GitHub (Official)**

### What It Does
Official GitHub integration enabling:
- Repository management, issue creation/tracking
- PR handling, code review
- GitHub Actions workflow monitoring, build failure analysis
- Release management
- Security scanning (code scanning findings, Dependabot alerts)
- Natural language repository interaction

### Why #6
- Most foundational integration for developer workflows
- On virtually every "best plugins" and "best MCP servers" list
- Automatic authentication handling
- Higher raw installs than #7-#10, but lower growth momentum and narrower problem space
- Free

**Install:** Standard MCP server configuration

---

## #7: Security Guidance

**TOPSIS Score: 0.68** | **Installs: 107,637** | **Creator: Anthropic (Verified)**

### What It Does
Pre-tool security hook that **automatically scans** for vulnerabilities when Claude edits files. Intercepts Write, Edit, and MultiEdit operations. Detects 8 vulnerability categories:
- Command injection in GitHub Actions
- Unsafe `child_process.exec()`
- `eval()` / `new Function()`
- XSS vectors (`dangerouslySetInnerHTML`, `innerHTML`)
- Python pickle deserialization
- `os.system()` command injection

### Why #7
- **Fastest growth rate:** From 25.5K installs (Jan 2026) to 107.6K (Apr 2026) = **4.2x in 3 months**
- Runs automatically with zero user commands required
- Essential for production workflows
- Session-scoped warnings with specific remediation advice
- Free

**Install:** `/plugin install security-guidance@claude-plugins-official`

---

## #8: Firecrawl

**TOPSIS Score: 0.65** | **GitHub Stars: 40,000+** | **Creator: Mendable Inc.**

### What It Does
Web scraping MCP that turns any website into clean, LLM-ready markdown and structured JSON. Removes ads, navigation, footers, and boilerplate. Available as both MCP server and Claude Code plugin.

### Why #8
- 40K GitHub stars -- one of the most-starred tools in the ecosystem
- Industry standard for web-to-LLM data conversion
- Available as both standalone MCP and Claude Code plugin
- Freemium (free tier: 10 scrapes/min, 10 maps/min, 5 searches/min)

**Install:** `/plugin install firecrawl@claude-plugins-official`

---

## #9: Skill Creator

**TOPSIS Score: 0.63** | **Installs: 131,592** | **Creator: Anthropic (Verified)**

### What It Does
The meta-plugin -- used to build and improve other plugins. Four operating modes:
1. **Create:** Generate new skills from descriptions
2. **Eval:** Test skills against evaluation prompts
3. **Improve:** AI-suggested skill improvements
4. **Benchmark:** Variance analysis and A/B comparisons

Four specialized agents: Executor, Grader, Comparator, Analyzer.

### Why #9
- Enables the entire plugin ecosystem to grow
- tessl.io: "Anthropic brings evals to skill-creator -- here's why that's a big deal"
- Includes utility scripts for initialization, validation, evaluation, and benchmarking
- Free

**Install:** `/plugin install skill-creator@claude-plugins-official`

---

## #10: Chrome DevTools MCP

**TOPSIS Score: 0.59** | **Installs: 20,829** | **Creator: Google (ChromeDevTools team)**

### What It Does
29 tools spanning browser automation, performance profiling, network analysis, and debugging through Puppeteer and Chrome DevTools Protocol:
- Lighthouse audits
- Mobile device emulation
- Performance tracing, memory snapshots
- Console message reading with source-mapped stack traces
- DOM snapshot capture
- Optional "slim mode" for lightweight tasks

### Why #10
Despite lower raw installs, it ranks here because:
- **Unique capability:** No other plugin provides full DevTools access
- Community tests show **40% reduction in debugging time**
- Comes with 6 built-in skills (a11y auditing, performance debugging, troubleshooting, etc.)
- Requires Chrome 144+
- High growth momentum for its category
- Free

**Install:** `/plugin marketplace add ChromeDevTools/chrome-devtools-mcp`

---

## Notable Mentions (Just Outside Top 10)

| Plugin | Installs | Creator | Notable For |
|--------|----------|---------|-------------|
| Code Simplifier | 178,204 | Anthropic | Open-sourced from Anthropic's internal tooling |
| Feature Dev | 155,235 | Anthropic | Structured exploration -> architecture -> review workflow |
| Figma MCP | ~18,100 | Figma | Bidirectional design-to-code integration |
| connect-apps | N/A | ComposioHQ | Connects to 500+ SaaS apps (Slack, Gmail, Notion, etc.) |
| Claude-Mem | N/A | thedotmack | Long-term memory via SQLite + vector embeddings |
| Linear MCP | ~9,500 | Linear | Issue tracker integration |

---

## Key Observations

1. **Anthropic dominates:** 6 of top 10 are Anthropic-built (Frontend Design, Code Review, Security Guidance, Skill Creator + GitHub MCP and Playwright which are partner-built)
2. **All top plugins are free** -- freemium only appears with Firecrawl
3. **Frontend Design is the runaway leader** at 455K installs, reflecting massive demand to fix "AI slop" UI
4. **Superpowers is the community champion** -- highest-installed non-corporate plugin
5. **Security Guidance has fastest growth** -- 4.2x in 3 months (from 25.5K to 107.6K)

## Sources
- [Composio - Top Claude Code Plugins](https://composio.dev/content/top-claude-code-plugins)
- [Firecrawl - Best Claude Code Plugins](https://www.firecrawl.dev/blog/best-claude-code-plugins)
- [Build to Launch - Plugins Tested Review](https://buildtolaunch.substack.com/p/best-claude-code-plugins-tested-review)
- [Towards AI - 10 Claude Plugins You Actually Need](https://pub.towardsai.net/the-10-claude-plugins-you-actually-need-in-2026-and-what-they-are-85674941c324)
- [UX Planet - Top 7 Claude Code Plugins](https://uxplanet.org/top-7-claude-code-plugins-2f97c2fbb1be)
- [ClaudeFast - Best MCP Addons](https://claudefa.st/blog/tools/mcp-extensions/best-addons)
- [Claude Code Marketplaces](https://claudemarketplaces.com/)
- [ComposioHQ/awesome-claude-plugins (GitHub)](https://github.com/ComposioHQ/awesome-claude-plugins)
- [Claude Code Docs - Create Plugins](https://code.claude.com/docs/en/plugins)
