import { createStore } from "zustand";

interface TransitionStore {
	/** Set by a list pick just before it navigates, so the controller skips the title card. */
	source: "pick" | null;
	/** True while the ink panel covers the page: scroll is locked and the page is inert. */
	covering: boolean;
	/** True from the start of a transition until the new page may play its entrance. */
	entranceHeld: boolean;
}

type TransitionStoreActions = {
	setSource: (source: "pick" | null) => void;
	setCovering: (covering: boolean) => void;
	holdEntrance: () => void;
	releaseEntrance: () => void;
};

export const createTransitionStore = () =>
	createStore<TransitionStore & TransitionStoreActions>()((set) => ({
		source: null,
		covering: false,
		entranceHeld: false,
		setSource: (source) => set({ source }),
		setCovering: (covering) => set({ covering }),
		holdEntrance: () => set({ entranceHeld: true }),
		releaseEntrance: () => set({ entranceHeld: false }),
	}));

export const transitionStore = createTransitionStore();

type Store = ReturnType<typeof createTransitionStore>;

interface Playable {
	pause: () => unknown;
	play: () => unknown;
}

/**
 * Holds an entrance timeline while a section transition still covers the
 * page, and plays it when the controller releases the entrance. Returns a
 * cleanup that stops listening, or undefined when nothing is held.
 */
export function gateEntrance(
	timeline: Playable,
	store: Store = transitionStore,
): (() => void) | undefined {
	if (!store.getState().entranceHeld) return undefined;
	timeline.pause();
	const unsubscribe = store.subscribe((state) => {
		if (state.entranceHeld) return;
		unsubscribe();
		timeline.play();
	});
	return unsubscribe;
}
