# Architecture

How the application is structured and how new code should fit in. The stack is recorded in [decision 0006](decisions/0006-tanstack-start-application-stack.md) and the folder layout in [decision 0009](decisions/0009-feature-folder-structure.md).

## Stack and entry points

A TypeScript React app on TanStack Start, running on Node.js in production ([decision 0005](decisions/0005-vercel-deployment.md)): TanStack Router for file-based routes, TanStack Query for client data, the React compiler, Tailwind CSS, and Nitro for server output. All of it is configured in [../vite.config.ts](../vite.config.ts).

| File | Owns |
| --- | --- |
| [../src/router.tsx](../src/router.tsx) | `getRouter()`: router plus a fresh QueryClient per request, wired for SSR |
| [../src/routes/__root.tsx](../src/routes/__root.tsx) | HTML document, metadata, stylesheets, scripts, devtools |
| `src/routes/_public/route.tsx` | Public layout: navbar and [site menu](ui.md#site-menu), page outlet, footer, intro curtain, coming-soon redirect |
| `src/routes/_dashboard/`, `src/routes/admin/` | Admin layout and pages (`_dashboard`, guarded), and the sign-in page (`admin/`, unguarded) |
| [../src/routeTree.gen.ts](../src/routeTree.gen.ts) | Generated from the route files; never edit by hand |

## Planned routes

Route groups that start with `_` (`_public`, `_dashboard`) are pathless layouts and do not appear in URLs.

| URL | Route file | Purpose |
| --- | --- | --- |
| `/` | `_public/index.tsx` | Hero, description, 3 featured projects, 3 top skills, contact links, resume download |
| `/projects` | `_public/projects/index.tsx` | All published projects |
| `/projects/<slug>` | `_public/projects/$.tsx` | Case study for one project. A splat, so deeper paths 404 inside the layout |
| `/skills` | `_public/skills/index.tsx` | All skills, each linking to its page |
| `/skills/<slug>` | `_public/skills/$slug.tsx` | One skill: its confidence, a tool filter, and the projects that used its tools |
| `/coming-soon` | `coming-soon.tsx` | Holding page while the site is gated; `noindex` |
| `/admin/sign-in` | `admin/sign-in.tsx` | Owner sign-in; outside the guarded layout, `noindex` |
| `/admin`, `/admin/…` | `_dashboard/admin/…` | Dashboard home and the create/edit screens for each content type; owner only, `noindex` |

```mermaid
flowchart TD
    Home["/"] --> Projects["/projects"] --> Detail["/projects/&lt;slug&gt;"]
    Home --> Skills["/skills"] --> Detail
    SignIn["/admin/sign-in"] --> Admin["/admin/… (_dashboard, owner only)"]
```

## Coming-soon gate

While the site is not ready, public pages redirect to `/coming-soon`. One environment variable controls the gate, and there is no bypass for the owner:

| `COMING_SOON` | Result |
| --- | --- |
| not `"true"` | Site is public; `/coming-soon` redirects to `/` |
| `"true"` | Public pages redirect to `/coming-soon` |

```ts
// src/features/site/site.utils.ts
export function isSiteGated(comingSoon: string | undefined) {
	return comingSoon === "true";
}
```

The gate is not authentication. Admin pages use an owner password and a signed session cookie ([intent](intent.md#answered-questions)), described below. The `_dashboard` layout is outside the gate, so the owner can sign in while the public site is gated.

## Admin authentication

Recorded in [decision 0019](decisions/0019-owner-password-admin-auth.md). The owner signs in with one password; there is no auth provider, user table, role, or sign-up. A valid signed `admin_session` cookie means the owner.

```mermaid
flowchart LR
    SignIn["/admin/sign-in"] --> Fn["auth.functions.ts<br/>signIn / signOut"]
    Fn --> Utils["auth.utils.ts<br/>verifyPassword, signSession"]
    Layout["_dashboard beforeLoad"] --> Check["auth.functions.ts<br/>getAdminSession"]
    Check --> Utils
    Admin["Admin *.functions.ts"] --> Require["requireAdmin()<br/>auth.server.ts"]
    Require --> Utils
```

| Layer | Rule |
| --- | --- |
| Security boundary | Every admin server function calls `requireAdmin()` first. It verifies the `admin_session` cookie's signature and expiry with `ADMIN_SESSION_SECRET` and answers 401 when the cookie is missing, tampered, expired, or signed with another secret. A missing secret locks the dashboard. |
| Route guard | `_dashboard`'s `beforeLoad` redirects signed-out visitors to `/admin/sign-in`. It is a UX layer and never replaces `requireAdmin()`: server functions are served from `/_serverFn/...`, outside any route guard. |
| Sign-in route | Lives outside `_dashboard`, so the redirect cannot loop. It follows a `redirect` search param only for `/admin` paths. |
| Config | `ADMIN_PASSWORD_HASH` (a scrypt hash) and `ADMIN_SESSION_SECRET` are server-only environment variables. |
| Code | `src/features/auth/` per [0009](decisions/0009-feature-folder-structure.md); admin content features import `requireAdmin` from its `.server.ts`. |

```ts
// <feature>.functions.ts (intended shape)
export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator(deleteProjectSchema)
  .handler(async ({ data }) => {
    await requireAdmin(); // always the first line
    return deleteProjectById(data.id);
  });
```

## Data flow

Pages load data through route loaders that call server functions. Server functions call server-only modules, which own all database access.

```mermaid
flowchart LR
    Loader["Route loader"] --> Fn["feature.functions.ts<br/>createServerFn"]
    Fn --> Server["feature.server.ts"]
    Server --> DB["Prisma Next / Neon"]
    Fn -->|"plain data"| Loader
    Loader --> Page["Route component"]
```

- A server function returns plain, serializable data. Components render it during SSR and hydrate on the client. React Server Components are not used for now ([decision 0011](decisions/0011-no-react-server-components.md)).
- Load independent sections in parallel (`Promise.all` in the loader).
- UI never imports `*.server.ts` directly; TanStack Start blocks it from the client bundle.
- Server functions accept same-origin calls only. The CSRF middleware in [../src/start.ts](../src/start.ts) checks `Sec-Fetch-Site`, then `Origin`, then `Referer`, and answers anything else, including requests with none of those headers, with a 403. Page requests are not checked.

## Folder ownership

| Location | Responsibility |
| --- | --- |
| `src/routes/` | URLs, loaders, page composition |
| `src/features/<feature>/` | Feature code: `.server.ts`, `.functions.ts`, `utils`, `types`, `hooks/`, `components/` ([0009](decisions/0009-feature-folder-structure.md)). Client UI stores (zustand) live in `utils/` ([0015](decisions/0015-zustand-for-client-ui-state.md)) |
| `src/components/`, `src/components/ui/` | Shared components and shadcn primitives |
| `src/lib/` | Shared utilities |
| `src/integrations/` | Prisma runtime and contract, TanStack Query wiring, GSAP setup (`animations/`) |
| `src/styles.css`, `src/styles/` | Global styles and tokens ([ui](ui.md)) |
| `migrations/` | Prisma Next migrations ([data](data.md)) |
| `vercel.json` | Vercel settings ([0005](decisions/0005-vercel-deployment.md)) |

Expected features: `public` (landing page), `projects`, `skills`, `site` (gate), `auth` (admin sign-in and `requireAdmin()`), and an admin feature for the dashboard.
