# 0005: Vercel deployment on the Node.js runtime

Date: 2026-10-05
Updated: 2026-10-05
Status: Accepted

## Context

The site deploys on Vercel (project `final-portfolio`) through the Git integration: `main` builds production at `portfolio.wends.dev`, and other branches build login-protected previews. The repository uses Bun as package manager and dev tool.

Earlier on 2026-10-05, `vercel.json` set `bunVersion: "1.x"` to run production on Vercel's Bun runtime, so the app could use Bun's built-in S3 client for Neon Object Storage. The owner then weighed Bun against Node.js and chose Node.js for production.

## Decision

Run production on Vercel's **Node.js runtime**. Keep Bun for installing, building, and local development. [../../vercel.json](../../vercel.json):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "bun install --frozen-lockfile",
  "buildCommand": "bun --bun run build"
}
```

Nitro picks Vercel's Bun runtime whenever the build itself runs under Bun (`"Bun" in globalThis`), which `bun --bun run build` does. [../../vite.config.ts](../../vite.config.ts) therefore sets the runtime explicitly:

```ts
nitro({
  vercel: { functions: { runtime: "nodejs24.x" } },
});
```

This only affects the `vercel` preset; local builds still use Nitro's `bun` preset. `--frozen-lockfile` fails the build if `bun.lock` and `package.json` disagree.

Do not use Bun-only runtime APIs (`Bun.s3`, `Bun.sql`, `Bun.password`, and similar) in application code. S3 storage uses `@aws-sdk/client-s3`, which Neon documents for its buckets.

```mermaid
flowchart LR
    Dev["Local: bun --bun run dev"] --> Code["App code: Node-compatible APIs only"]
    Build["Vercel build: bun install + bun --bun run build"] --> Out[".vercel/output<br/>Node.js function"]
    Code --> Out
```

## Alternatives

**Bun runtime on Vercel (`bunVersion`) with `Bun.s3`.** Rejected for now.

| | Bun runtime | Node.js runtime (chosen) |
| --- | --- | --- |
| Status on Vercel | Public beta | Generally available |
| S3 client | Built in, no packages | `@aws-sdk/client-s3` + presigner |
| Neon Object Storage | Should work; checksum behavior untested | Documented by Neon |
| Production debugging | No automatic source maps | Source maps |
| Cold starts | No bytecode caching | Bytecode caching |
| Vitest ([0010](0010-vitest-tests-in-every-pr.md)) | Cannot run Bun APIs on Bun 1.3 | Runs everything natively |
| Versions | Local, CI, and Vercel must match; 1.4 is a breaking rewrite | Routine |
| Switching later | Hard once Bun APIs are in code | Easy |

Revisit when Vercel's Bun runtime is generally available and the project moves to Bun 1.4.

## Consequences

- Production runs on a mature runtime with source maps, metrics, and bytecode caching.
- Two more dependencies for storage (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`). Keep them behind one `storage.server.ts` module so a later switch touches one file.
- Development runs Vite on Bun (`--bun`) while production runs Node.js. Only Node-compatible APIs are allowed, and CI tests run on Node.js, which catches most gaps.
- Environment variables (`DATABASE_URL`, `COMING_SOON`, `PREVIEW_TOKEN`, and later the S3 credentials) live in the Vercel project, per environment.
- Every push to `main` deploys to production.

## Validation

On 2026-10-05, a production deployment on the Bun runtime succeeded and `/coming-soon` responded. After the switch, `NITRO_PRESET=vercel bun --bun run build` wrote `"runtime": "nodejs24.x"` to `.vc-config.json`, and `verify` passed. The Node.js deployment is validated when the next production deployment succeeds and `/coming-soon` responds.
