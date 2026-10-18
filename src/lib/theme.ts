import { createStore } from "zustand";

export const THEME_KEY = "color-schema";

// Inline in <head>: runs before first paint, so it must stay dependency-free.
// A stored "light" or "dark" wins; anything else (nothing stored, an unknown
// value, or storage that throws) follows the system. Toggles only the `dark`
// class so other classes on <html> stay.
export const themeHeadScript = `(function(){var t=null;try{t=localStorage.getItem("${THEME_KEY}")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.classList.toggle("dark",t==="dark")})()`;

export type ThemeChoice = "auto" | "light" | "dark";

const DARK_QUERY = "(prefers-color-scheme: dark)";

/** Each click moves to the next choice: auto → light → dark → auto. */
const NEXT_CHOICE: Record<ThemeChoice, ThemeChoice> = {
	auto: "light",
	light: "dark",
	dark: "auto",
};

/** The stored choice; nothing stored, an unknown value or blocked storage is auto. */
export function readStoredChoice(): ThemeChoice {
	try {
		const stored = localStorage.getItem(THEME_KEY);
		if (stored === "light" || stored === "dark") return stored;
	} catch {}
	return "auto";
}

/** Sets the `dark` class on <html> for a choice; auto asks the system. */
function setDarkClass(choice: ThemeChoice) {
	const dark =
		choice === "auto" ? matchMedia(DARK_QUERY).matches : choice === "dark";
	document.documentElement.classList.toggle("dark", dark);
}

/** Remembers a choice (auto forgets it, so the head script follows the system) and shows it. */
export function applyChoice(choice: ThemeChoice) {
	try {
		if (choice === "auto") localStorage.removeItem(THEME_KEY);
		else localStorage.setItem(THEME_KEY, choice);
	} catch {}
	setDarkClass(choice);
}

interface ThemeStore {
	/** "auto" on the server and in the first client render; hydrate() reads the real one. */
	choice: ThemeChoice;
}

interface ThemeStoreActions {
	/** Reads the stored choice and starts following system changes while on auto. Browser only. */
	hydrate: () => void;
	cycle: () => void;
}

export const createThemeStore = () =>
	createStore<ThemeStore & ThemeStoreActions>()((set, get) => {
		// hydrate() can run more than once (Strict Mode, remounts); listen once.
		let listening = false;

		return {
			choice: "auto",
			hydrate: () => {
				set({ choice: readStoredChoice() });
				if (listening) return;
				listening = true;
				matchMedia(DARK_QUERY).addEventListener("change", () => {
					if (get().choice === "auto") setDarkClass("auto");
				});
			},
			cycle: () => {
				const choice = NEXT_CHOICE[get().choice];
				set({ choice });
				applyChoice(choice);
			},
		};
	});

export const themeStore = createThemeStore();
