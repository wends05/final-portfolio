export const INTRO_KEY = "intro-seen";
export const INTRO_LIFT_AT = 1.55; // s, curtain starts lifting
export const INTRO_HERO_DELAY = 1.7; // s, hero waits while the curtain lifts

// Inline in <head>: runs before first paint, so it must stay dependency-free.
export const introHeadScript = `(function(){var s="play";try{if(sessionStorage.getItem("${INTRO_KEY}"))s="seen"}catch(e){}document.documentElement.dataset.intro=s})()`;

export function introPlaying() {
	return document.documentElement.dataset.intro === "play";
}

export function markIntroSeen() {
	document.documentElement.dataset.intro = "seen";
	try {
		sessionStorage.setItem(INTRO_KEY, "1");
	} catch {}
}

/** Ends a pending intro without playing it or remembering it as seen. */
export function skipIntro() {
	if (introPlaying()) document.documentElement.dataset.intro = "seen";
}
