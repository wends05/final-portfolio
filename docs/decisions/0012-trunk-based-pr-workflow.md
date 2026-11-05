# 0012: Trunk-based pull request workflow

Date: 2026-10-05
Updated: 2026-10-05 (merge commits instead of squash merge, by owner decision); 2026-11-05 (branch protection applied)
Status: Accepted

## Context

Pushing `main` deploys production on Vercel ([0005](0005-vercel-deployment.md)), CI runs `verify` on every pull request ([0010](0010-vitest-tests-in-every-pr.md)), and work is tracked in Linear (team `me`, key `WD`). The owner wanted readable branch names, Linear issues referenced from the PR description because one PR can resolve several issues, and a decision on whether to keep a separate development branch.

## Decision

Work trunk-based: short-lived branches merge into `main` through pull requests. There is no `develop` branch; after launch the owner confirmed this in [0022](0022-preview-every-branch-no-develop.md).

```mermaid
flowchart LR
    Branch["feat/short-name"] --> PR["Pull request<br/>CI + Vercel preview"]
    PR -->|merge commit| Main["main"] --> Prod["production"]
```

| Rule | Detail |
| --- | --- |
| Branch names | `<type>/<short-name>`, with the conventional-commit type: `feat/navbar-links`, `fix/gate-cookie`, `ci/vitest-verify`, `refactor/remove-rsc`, `docs/git-workflow`. Not Linear's generated names. |
| Commits | Every commit on a branch is a conventional commit (`feat:`, `fix:`, `docs:`…), because merge commits keep them all in `main`'s history. |
| PR title | A conventional commit (`feat: add navbar links`); it becomes the description of the merge commit. |
| Linear links | In the PR description, one issue per line. `Closes WD-12` (or `Fixes`, `Resolves`) moves the issue to Done on merge; `Part of WD-13` or `Refs WD-21` only links it. |
| PR description | Follows [../../.github/pull_request_template.md](../../.github/pull_request_template.md): Linear, What, Tests, Checks, Not checked. |
| Merge | Merge commit ("Create a merge commit") after CI passes. The owner merges. |
| Stacked PRs | Allowed when one change needs another: base the second PR on the first PR's branch, and rebase it onto `main` after the first merges. |
| Renaming | Never rename a branch that has an open PR: GitHub closes the PR. |

## Alternatives

- **`develop` + `main` (Git Flow-style):** a fixed staging URL for testing merged features together. Rejected for now: every change would need two merges, the branches drift, and each needs CI and protection. Until launch, production is behind the coming-soon gate, so `main` already acts as staging, and every PR has its own Vercel preview. Revisited after launch and rejected again in [0022](0022-preview-every-branch-no-develop.md) (Linear WD-50).
- **Squash merge:** one commit per PR on `main`, but the owner chose merge commits, which keep each branch's commits.
- **Linear IDs in branch names or PR titles:** links automatically, but one PR often resolves several issues, and generated branch names are long.

## Consequences

- One merge per change. `main` keeps every branch commit plus a merge commit per PR, so commit messages on branches matter.
- Closing keywords keep Linear in sync without manual status changes.
- A repository ruleset named `main` protects the default branch: changes arrive only through pull requests, the `verify` check from GitHub Actions must pass, merge commits are the only allowed merge method, and deleting or force-pushing `main` is blocked. No review approval is required, because the owner works alone. Merged head branches are deleted automatically. The advisory Claude review is never a required check.
- Every branch gets a Vercel preview ([0022](0022-preview-every-branch-no-develop.md), which replaced the `main`-and-`development`-only rule in [0014](0014-vercel-deploys-main-and-development-only.md)).

## Validation

On 2026-10-05, PRs #1 and #2 were closed by renaming their branches and reopened as #3 (`ci/vitest-verify`) and #4 (`refactor/remove-rsc`), which use this format.

On 2026-11-05 the ruleset was created through the GitHub API, and `delete_branch_on_merge` was turned on. The rules GitHub reports for `main` are `deletion`, `non_fast_forward`, `pull_request`, and `required_status_checks`. To inspect or change them:

```bash
gh api repos/wends05/final-portfolio/rules/branches/main
gh api repos/wends05/final-portfolio/rulesets
```
