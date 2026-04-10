# Top 5 Plugins/Extensions for Google Antigravity / VS Code

**Research Date:** April 9, 2026
**Ranking Method:** Modified TOPSIS with Bayesian Smoothing (see 00-ranking-methodology.md)

---

## What Is Google Antigravity?

Google Antigravity is an AI-powered IDE announced November 18, 2025, alongside Gemini 3. It is a **heavily modified fork of Visual Studio Code** designed as an "agent-first" development platform.

### Key Facts
- **Price:** Free for individuals (public preview); Pro $20/mo; Ultra $249.99/mo
- **Built-in models:** Gemini 3.1 Pro, Claude Sonnet 4.6, GPT-OSS 120B
- **SWE-bench score:** 76.2% (1% behind Claude Sonnet 4.5)
- **Extension marketplace:** OpenVSX (not VS Code Marketplace)
- **Built-in agents:** 16 via AgentKit 2.0 (frontend, backend, QA, infrastructure)

### Why This Matters for Extensions
Since Antigravity is a VS Code fork, **most VS Code extensions work on it** via `.vsix` install or OpenVSX. However, Microsoft-licensed extensions (C# Dev Kit, Pylance, Remote-SSH) are blocked. The ranking below focuses on AI-focused extensions that work on **both** platforms.

---

## Antigravity's Built-In Capabilities (Not Extensions)

Before ranking extensions, it's important to note what Antigravity ships with natively:

| Built-In Feature | What It Replaces |
|-------------------|-----------------|
| **Agent Manager** | Multi-agent orchestration (no extension needed) |
| **Browser Subagent** | Replaces Playwright MCP for basic testing |
| **AgentKit 2.0** (16 agents, 40+ skills) | Replaces many specialized plugins |
| **Artifacts System** | Task lists, screenshots, recordings built in |
| **MCP Builder** | Connect APIs and automations natively |

---

## TOPSIS Ranking Results

| Rank | Extension | Installs | Bayesian Rating | TOPSIS CC | Key Differentiator |
|------|-----------|----------|-----------------|-----------|-------------------|
| 1 | GitHub Copilot | 72.8M | 4.02 | 0.92 | Dominant adoption + Agent Mode |
| 2 | Claude Code for VS Code | 9.7M | 4.01 | 0.81 | Deep reasoning + fastest updates |
| 3 | Cline | 3.6M | 4.05 | 0.76 | Fastest-growing OSS, full browser automation |
| 4 | Roo Code | 1.5M | 4.89 | 0.72 | Highest quality signal (5/5 stars, 339 reviews) |
| 5 | Continue | 2.6M | 3.68 | 0.67 | Most flexible (any model, including local) |

---

## #1: GitHub Copilot

**TOPSIS Score: 0.92** | **Installs: 72,823,938** | **Rating: 4/5 (1,047 reviews)**

### Publisher
GitHub (Microsoft)

### What It Does
Industry-standard AI pair programmer with:
- Inline code completions and Chat
- **Agent Mode** (GA March 2026): Autonomous multi-step coding
- **Coding Agent:** Turns GitHub issues into PRs autonomously in background
- **Autopilot** (public preview): Fully autonomous agent sessions
- **Next Edit Suggestions:** Predicts where and what to edit next
- Access to Claude Opus 4, OpenAI o3, and Gemini models on Pro+

### Price
- Free: 50 requests/month
- Pro: $10/month
- Pro+: $39/month (full model access)
- Business: $19/user/month
- Enterprise: $39/user/month

### Why #1
- **72.8 million installs** -- more than all other AI extensions combined
- Agent Mode went GA March 2026, matching agentic competitors
- Broadest model access (Claude, OpenAI, Gemini) on paid plans
- Most mature ecosystem, continuously updated
- Integrated browser debugging added March 2026

### Antigravity Compatibility
Via `.vsix` install. Some features may have licensing restrictions on non-Microsoft IDEs.

### Sources
- [VS Code Marketplace - GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot)
- [GitHub Blog - Copilot March 2026 Release](https://github.blog/changelog/2026-04-08-github-copilot-in-visual-studio-code-march-releases/)

---

## #2: Claude Code for VS Code

**TOPSIS Score: 0.81** | **Installs: 9,660,124** | **Rating: 4/5 (641 reviews)**

### Publisher
Anthropic

### What It Does
Official Anthropic extension providing Claude Code directly inside VS Code:
- Autonomous codebase exploration and code reading/writing
- Real-time inline diffs
- Multi-tab conversations
- Subagent orchestration
- MCP server support
- Custom slash commands
- @-mention files for context

### Price
Free extension. Requires Claude Pro/Max/Team/Enterprise subscription or pay-as-you-go API key.

### Why #2
- **9.7M installs** growing rapidly (GA in early 2026)
- **Updated April 8, 2026** (v2.1.96) -- the most frequently updated extension
- Deep reasoning "senior consultant" capabilities
- Full MCP ecosystem integration (9,000+ plugins)
- Claude Sonnet 4.5 is also **built into Antigravity natively**
- 82K GitHub stars on the Claude Code CLI repo

### Antigravity Compatibility
Claude Sonnet 4.5 is built into Antigravity. The VS Code extension can also be installed via `.vsix`.

### Sources
- [VS Code Marketplace - Claude Code](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)
- [Claude Code Docs - VS Code](https://code.claude.com/docs/en/vs-code)

---

## #3: Cline

**TOPSIS Score: 0.76** | **Installs: 3,554,953** | **Rating: 4/5 (278 reviews)** | **GitHub Stars: 60,100**

### Publisher
Cline (saoudrizwan)

### What It Does
Autonomous coding agent in VS Code:
- Creates/edits files, executes terminal commands
- Launches headless browser with screenshot capture
- Plan/Act modes for review before execution
- MCP server support
- Workspace checkpoint/restore (undo any agent action)
- Cost tracking per session

### Price
Free (BYOK -- bring your own API key for OpenRouter, Anthropic, OpenAI, Google Gemini, AWS Bedrock, or local models)

### Why #3
- **Fastest-growing AI OSS project on GitHub** (4,704% YoY contributor growth per GitHub Octoverse 2025)
- 60,100 GitHub stars -- massive community
- Full browser automation without separate extension
- Workspace checkpoints let you safely undo any agent action
- Works with ANY LLM provider (maximum flexibility)
- Updated April 1, 2026 (v3.77.0) -- very active

### Antigravity Compatibility
Yes, via `.vsix` or OpenVSX.

### Sources
- [VS Code Marketplace - Cline](https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev)
- [Cline GitHub](https://github.com/cline/cline)

---

## #4: Roo Code

**TOPSIS Score: 0.72** | **Installs: 1,456,540** | **Rating: 5/5 (339 reviews)** | **GitHub Stars: ~23,000**

### Publisher
Roo Code, Inc.

### What It Does
"A whole dev team of AI agents in your editor" -- multiple operational modes:
- **Code Mode:** Autonomous code generation and refactoring
- **Architect Mode:** High-level design and planning
- **Ask Mode:** Codebase Q&A
- **Debug Mode:** Systematic bug hunting
- **Custom Modes:** User-defined agent personalities

Also includes: checkpoint functionality, MCP server integration, 20+ language support.

### Price
Free (BYOK)

### Why #4
- **Highest quality signal of any AI extension:** Perfect 5/5 stars with 339 reviews
- Bayesian-smoothed rating still 4.89 -- the highest in the dataset
- SOC 2 Type 2 compliant (enterprise-ready)
- Multiple specialized modes reduce context switching
- Updated April 8, 2026 (v3.52.0) -- very active
- 23K GitHub stars and growing rapidly

### Antigravity Compatibility
Yes, via `.vsix` or OpenVSX.

### Sources
- [VS Code Marketplace - Roo Code](https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline)
- [Roo Code GitHub](https://github.com/RooCodeInc/Roo-Code)

---

## #5: Continue

**TOPSIS Score: 0.67** | **Installs: 2,563,430** | **Rating: 3.5/5 (136 reviews)** | **GitHub Stars: ~32,300**

### Publisher
Continue Dev, Inc.

### What It Does
Leading open-source AI code agent with four modes:
- **Agent:** Autonomous task execution
- **Chat:** Interactive Q&A about code
- **Edit:** Targeted code modifications
- **Autocomplete:** Inline suggestions

Connects to **any LLM** -- cloud providers (OpenAI, Anthropic, Google) OR local models (Ollama, llama.cpp, LM Studio). Source-controlled AI checks enforceable in CI.

### Price
Free and open source (Apache 2.0). Paid Mission Control platform for teams/enterprises.

### Why #5
- **Most flexible model selection** of any extension: any provider, including fully local
- 32,300 GitHub stars -- strong open source community
- 809 releases as of March 2026 -- most iterated extension
- Apache 2.0 license -- no vendor lock-in
- Best for teams wanting full control over model choice and data privacy
- Updated March 27, 2026 (v1.3.38)

### Antigravity Compatibility
Yes, via OpenVSX or `.vsix`.

### Sources
- [VS Code Marketplace - Continue](https://marketplace.visualstudio.com/items?itemName=Continue.continue)
- [Continue GitHub](https://github.com/continuedev/continue)

---

## Honorable Mentions

| Extension | Installs | Rating | Why Noteworthy |
|-----------|----------|--------|---------------|
| **Windsurf/Codeium** | 3.6M | 5/5 (1,457) | Best free unlimited completions; highest raw rating |
| **Qodo (CodiumAI)** | 852K | 4.5/5 (490) | Best for code review and test generation specifically |
| **Augment Code** | 737K | 3.5/5 (336) | Best for large enterprise codebases; #1 SWE-bench open-source |
| **Cody (Sourcegraph)** | 821K | 4/5 (149) | Best codebase-level context via Sourcegraph indexing |
| **Tabnine** | 9.5M | 4/5 (614) | Best local/private model option; legacy but well-established |

---

## Antigravity-Native Extensions

These extensions are built specifically for Antigravity (not VS Code ports):

| Extension | Publisher | What It Does |
|-----------|-----------|-------------|
| **Toolkit for Antigravity** | n2ns | Quota monitoring, usage analytics, cache management, AI commit generation, hands-free mode |
| **Antigravity HUD** | smallyu | Lightweight status-bar quota monitor, consumption speed estimates |
| **Antigravity AutoPilot** | nguyenhx2 | Auto-executes terminal commands and browser actions, dangerous command blocking |
| **C4X** | JPantsjoha | Agentic C4 architecture diagramming built with Gemini 3 |

Note: Antigravity's native extension ecosystem is still nascent (launched ~5 months ago). Its real power comes from built-in AgentKit 2.0, the Browser Subagent, and VS Code extension compatibility.

---

## Key Findings

1. **Copilot dominates at 72.8M installs** but Claude Code (9.7M) and Cline (3.6M) are growing fast
2. **The market has bifurcated:** completion tools (Copilot, Windsurf) vs agentic tools (Cline, Roo Code, Continue). Agentic is growing faster.
3. **Roo Code has the highest user satisfaction** (5/5, 339 reviews) of any AI extension
4. **Antigravity's competitive advantage is NOT extensions** -- it's the integrated architecture (Editor + Agent Manager + Browser) and free access to Gemini 3 Pro + Claude + GPT-OSS
5. **All top 5 are free or freemium** -- the AI coding extension market is commoditizing rapidly

## Sources
- [VS Code Marketplace](https://marketplace.visualstudio.com/)
- [OpenVSX Registry](https://open-vsx.org/)
- [Idlen - Best VS Code AI Extensions 2026](https://www.idlen.io/blog/best-vscode-extensions-ai-coding-2026)
- [Scopir - Best VS Code Extensions 2026](https://scopir.com/posts/best-vscode-extensions-developer-productivity-2026/)
- [Graphite - Best VS Code AI Extensions](https://graphite.com/guides/best-vscode-extensions-ai)
- [Google Developers Blog - Antigravity](https://developers.googleblog.com/build-with-google-antigravity-our-new-agentic-development-platform/)
- [awesome-antigravity (GitHub)](https://github.com/MichaelZelbel/awesome-antigravity)
- [Antigravity AgentKit 2.0](https://antigravitylab.net/en/articles/agents/antigravity-agentkit-2-specialized-agents-mastery)
