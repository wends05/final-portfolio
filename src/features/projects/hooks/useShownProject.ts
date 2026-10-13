import {
	type FocusEvent,
	type PointerEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { INDEX_FOCUS_LINE, nearestIndex } from "../projects.utils";

/**
 * Which project the /projects details panel shows.
 *
 * - Scrolling picks the tile nearest the focus line (`active`).
 * - Hovering a tile with a mouse, or keyboard focus, picks that tile and keeps
 *   it after the pointer leaves (`hovered`). Touch never hovers, so phones
 *   stay on scroll.
 * - A pick pins the picked tile and freezes scrolling, so stopping Lenis
 *   can't swap the panel mid-transition.
 */
export function useShownProject(count: number) {
	const list = useRef<HTMLDivElement>(null);
	const panel = useRef<HTMLElement>(null);
	const frozen = useRef(false);
	const [active, setActive] = useState(0);
	const [hovered, setHovered] = useState<number | null>(null);
	const [pinned, setPinned] = useState<number | null>(null);
	const [pointerOnGrid, setPointerOnGrid] = useState(false);

	useEffect(() => {
		if (count === 0) return;
		let frame = 0;
		const wide = window.matchMedia("(width >= 48rem)");

		const measure = () => {
			frame = 0;
			if (frozen.current || !list.current) return;
			const tiles = list.current.querySelectorAll<HTMLElement>("[data-tile]");
			// On phones the panel is a sticky strip over the top of the list, so
			// the line sits in the part of the screen below it.
			const top =
				!wide.matches && panel.current
					? panel.current.getBoundingClientRect().bottom
					: 0;
			const share = wide.matches
				? INDEX_FOCUS_LINE.wide
				: INDEX_FOCUS_LINE.narrow;
			const line = top + (window.innerHeight - top) * share;
			const boxes = Array.from(tiles, (tile) => tile.getBoundingClientRect());
			setActive(nearestIndex(boxes, line));
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(measure);
		};

		schedule();
		window.addEventListener("scroll", schedule, { passive: true });
		window.addEventListener("resize", schedule);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule);
			window.removeEventListener("resize", schedule);
		};
	}, [count]);

	return {
		list,
		panel,
		shown: pinned ?? hovered ?? active,
		/** Dim the other tiles while a mouse is over the grid, not during a pick. */
		dimOthers: pointerOnGrid && pinned === null,
		tileProps: (index: number) => ({
			onPointerEnter: (event: PointerEvent) => {
				if (event.pointerType === "mouse" && !frozen.current) setHovered(index);
			},
			onFocus: (event: FocusEvent<HTMLElement>) => {
				// A tap focuses the link too; only keyboard focus picks the tile.
				if (event.currentTarget.matches(":focus-visible")) setHovered(index);
			},
		}),
		listProps: {
			onPointerEnter: (event: PointerEvent) => {
				if (event.pointerType === "mouse") setPointerOnGrid(true);
			},
			onPointerLeave: () => setPointerOnGrid(false),
		},
		/** Pins `index` in the panel and stops scroll from changing it. */
		freeze: (index: number) => {
			frozen.current = true;
			setPinned(index);
		},
		unfreeze: () => {
			frozen.current = false;
			setPinned(null);
		},
	};
}
