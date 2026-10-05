# 0013: Zustand for client UI state

Date: 2026-10-06
Status: Accepted

## Context

The site menu (Linear WD-53, [UI conventions](../ui.md#site-menu)) has state that several components read: the navbar's Menu button (`aria-expanded`, its label), the overlay (which animation to run), and the public layout (`inert` and scroll lock on the page behind). The section page transition (Linear WD-51) will also need to know whether a navigation started in the menu. A `useReducer` in one component would have to pass its state and callbacks down to all of them.

On 2026-10-06 the owner chose a store library for this, between zustand and TanStack Store (familiar with both), and picked zustand.

## Decision

Client-only UI state that more than one component reads lives in a **zustand** store.

| Rule | Detail |
| --- | --- |
| Library | `zustand` 5 |
| Creating | `createStore` from `zustand/vanilla` inside a `create<Name>Store()` factory, plus one module-level instance the app uses |
| Reading | `useStore(store, selector)` from `zustand`, wrapped in a small hook such as `useMenu(selector)`. Select the smallest slice; a selector that builds a new object or array needs `useShallow` |
| Writing | Through actions defined in the store, which guard the allowed transitions. Components never call `setState` directly |
| Location | With its feature: `src/features/<feature>/utils/<name>.ts` ([0009](0009-feature-folder-structure.md)). A store shared across features goes in `src/lib/` |
| SSR | A module-level store is shared by every request on the server. Only client events call actions, never render, so the server always renders the initial state |
| Tests | Unit tests build a fresh store with the factory, so tests don't share state ([0010](0010-vitest-tests-in-every-pr.md)) |

Not for: server data (route loaders and TanStack Query), state that belongs in the URL (router search params), or state one component owns (`useState`).

```ts
// src/features/public/utils/menu.ts (sketch)
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";

export type MenuState =
	| { phase: "closed" }
	| { phase: "open" }
	| { phase: "closing" }
	| { phase: "leaving"; to: MenuPath };

export function createMenuStore() {
	return createStore<MenuStore>()((set) => ({
		menu: { phase: "closed" },
		toggle: () =>
			set((s) => {
				if (s.menu.phase === "open") return { menu: { phase: "closing" } };
				if (s.menu.phase === "leaving") return s; // ignored during a pick
				return { menu: { phase: "open" } };
			}),
		// pick, close, settled…
	}));
}

export const menuStore = createMenuStore();
export const useMenu = <T,>(select: (s: MenuStore) => T) =>
	useStore(menuStore, select);
```

Returning the unchanged state from `set` is a no-op, so an action that does not apply in the current phase re-renders nothing.

## Alternatives

- **TanStack Store 0.11:** same ecosystem as the router, with a separate typed `actions` API and derived atoms. TanStack Router already depends on `@tanstack/react-store`, so it would have added no bundle weight. Not chosen: it is pre-1.0 and its API changes between minor versions (0.11 deprecates `useStore` for `useSelector`, and older guides show APIs it no longer has), and its documentation is thinner. The owner preferred a stable major version for state that the menu and WD-51 build on.
- **`useReducer` with context or props:** no dependency, but every reader needs a provider or props, and a context re-renders all of its consumers on each change.
- **A hand-written module store with `useSyncExternalStore`:** what zustand already provides, without its tests or devtools middleware.

## Consequences

- Adds `zustand` (`^5.0.15`) to the dependencies, about 0.4 KB minified and gzipped for a menu-sized store.
- The bundle carries two store libraries: zustand for app code, and TanStack Store inside the router. App code imports only zustand.
- `package.json` lists `@tanstack/store` and `@tanstack/react-store` directly, but no source file imports them. Remove both when zustand is added; the router keeps its own copy.
- zustand's `persist` and `devtools` middleware are available if a later store needs them.

## Validation

On 2026-10-06:

- The npm registry listed zustand 5.0.15 and `@tanstack/store` 0.11.2 as current.
- `bun.lock` shows `@tanstack/react-router` 1.170.41 depending on `@tanstack/react-store` `^0.11.2`, and no file in `src/` imports either TanStack Store package.
- The same small store, bundled with Bun (minified, React external), measured about 0.4 KB gzipped with zustand and about 3 KB with `@tanstack/react-store`.
- A draft menu store on `zustand/vanilla` passed unit tests under Vitest on Node.js. The draft was not committed; the menu is implemented separately under WD-53.
