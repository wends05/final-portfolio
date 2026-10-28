import { useEffect, useState } from "react";
import { isNavbarSolid } from "#/features/public/utils/navbar";

/** Whether the page has scrolled past the top, so the navbar needs a background. */
export function useNavbarSolid() {
	const [solid, setSolid] = useState(false);

	useEffect(() => {
		const update = () => setSolid(isNavbarSolid(window.scrollY));
		// Read once on mount: the browser may have restored a scrolled position.
		update();
		window.addEventListener("scroll", update, { passive: true });
		return () => window.removeEventListener("scroll", update);
	}, []);

	return solid;
}
