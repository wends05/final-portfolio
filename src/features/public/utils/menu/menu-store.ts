import { createStore } from "zustand";
import type { MenuPath } from "./menu";

export type MenuPhase = "closed" | "open" | "closing" | "leaving";

interface MenuStore {
	phase: MenuPhase;
	/** Where a pick is heading, while the phase is `leaving`. */
	target: MenuPath | null;
}

type MenuStoreActions = {
	toggle: () => void;
	close: () => void;
	pick: (to: MenuPath) => void;
	finish: () => void;
};

export const createMenuStore = () =>
	createStore<MenuStore & MenuStoreActions>()((set) => ({
		phase: "closed",
		target: null,
		close: () =>
			set((state) => ({
				phase: state.phase === "open" ? "closing" : state.phase,
			})),
		toggle: () =>
			set((state) => ({
				...state,
				phase:
					state.phase === "closed"
						? "open"
						: state.phase === "open"
							? "closing"
							: state.phase,
			})),
		pick: (to) =>
			set((state) => {
				if (state.phase !== "open") {
					return state;
				}
				return {
					...state,
					phase: "leaving",
					target: to,
				};
			}),
		finish: () =>
			set((state) => {
				if (state.phase !== "closing" && state.phase !== "leaving") {
					return state;
				}
				return {
					...state,
					phase: "closed",
					target: null,
				};
			}),
	}));

export const menuStore = createMenuStore();
