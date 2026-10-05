# 0004: Repository-based development workflow

Date: 2026-10-04
Updated: 2026-10-05
Status: Accepted

## Context

The owner requested an adaptation of Anthropic's AI-native SDLC and shared `AGENTS.md` instructions for Codex and Claude Code. The initial foundation used separate intent, spec, plan, and verification files for substantial tasks. On 2026-10-05 the owner chose a lighter workflow and authorized removing those file sets and their templates while retaining ADRs.

## Decision

Use [../sdlc.md](../sdlc.md) as the workflow guide and `AGENTS.md` as the shared entry point. Plan individual tasks in chat, define observable acceptance criteria, implement within authorization, verify, and report actual results. Keep significant architectural rationale in this ADR directory and direction and conventions in topic docs. When an issue or PR is used, record useful task scope and evidence there.

Retain the `typecheck` and aggregate `verify` commands. Per-task folders and four-document templates are no longer required and have been removed.

Also on 2026-10-05, the owner chose to keep the docs forward-looking: they describe direction, conventions, and decisions, not implementation status. `status.md` and the current-state sections of other docs were removed. Check results are reported in chat or the PR; the code is the record of what exists.

This is a lighter adaptation: the full playbook's versioned intent/spec/plan chain is not implemented for every task. Local verification remains the starting point; CI, hooks, and deployment automation are separate future work.

## Alternatives

- Separate files for every substantial task: durable and useful for handoffs, but too much maintenance for this project's current needs.
- ADRs as the only planning tool: architectural rationale does not describe every feature's behavior or verification, so task planning and evidence remain necessary.
- A separate workflow repository or mandatory tracker: adds synchronization overhead for a single personal project.
- Duplicated Claude instructions: conflicts with the owner's preference for direct `AGENTS.md` support.

## Consequences

The workflow stays small while preserving planning, verification, and architectural reasoning. Without a status document, finding unfinished work means reading the code or asking an agent to survey it. Chat plans have weaker long-term discoverability than committed plans; important decisions and outcomes must reach topic docs, ADRs, or an issue/PR. Documents guide behavior rather than enforce tool permissions. Required failures must remain visible.

## Validation

Runner checks and the current application baseline are recorded in [../development.md](../development.md#validation). The 2026-10-05 simplification is documentation-only: check removed-directory absence, relative links, and obsolete workflow instructions. Application validation is not rerun for this edit.
