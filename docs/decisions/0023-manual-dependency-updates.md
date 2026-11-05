# 0023: Manual dependency updates; Dependabot alerts only

Date: 2026-11-05
Status: Accepted
Supersedes: [0016](0016-dependabot-dependency-updates.md)

## Context

[0016](0016-dependabot-dependency-updates.md) had Dependabot open version-update pull requests: a monthly grouped npm PR, one PR per major update, and a weekly GitHub Actions PR. After launch the owner did not want to review update PRs for a finished portfolio, and chose on 2026-11-05 to update dependencies only when working on the code that uses them.

## Decision

There is no `.github/dependabot.yml`, so Dependabot opens no version-update pull requests. Dependabot security updates stay off.

Dependabot alerts stay on. A known vulnerability in a dependency shows in the repository's Security tab and does not open a pull request. CI keeps running `bun audit` as a non-blocking step ([../../.github/workflows/ci.yml](../../.github/workflows/ci.yml)).

To update by hand, on a `chore/<short-name>` branch:

```bash
bun outdated
bun update <package>        # within the package.json range
bun add <package>@latest    # a new major; read its changelog first
bun --bun run verify
```

## Alternatives

- **Keep 0016's schedule:** keeps dependencies current, but every month brings PRs to review, even when nothing on the site changes.
- **Keep `dependabot.yml` with `open-pull-requests-limit: 0`:** the same result, and easier to switch back, but leaves config in the repository that does nothing.
- **Turn off alerts too:** no notices at all, so a vulnerability in a deployed dependency would go unnoticed.

## Consequences

- Dependencies drift until the owner updates them. A large jump across several majors takes more work in one sitting.
- `@types/node` must still match the Node.js runtime (24, [0005](0005-vercel-deployment.md)). Without the old ignore rule, check it by hand when updating.
- Restoring `.github/dependabot.yml` from git history turns version updates back on.
- `dependabot/...` branches no longer appear, so [0012](0012-trunk-based-pr-workflow.md)'s branch-name rule has no exception in practice.

## Validation

On 2026-11-05, before this change, the repository had Dependabot alerts on with 0 open alerts and security updates off. The last version-update PR (#63) was merged first.
