import { getProjectPeriodLabel } from "#/features/public/utils/project-meta";
import type { Collaborator, Project } from "#content";
import type { ProjectCredit, ProjectLinkTarget } from "./projects.types";

/**
 * Where `slug` sits in an ordered list (from 1), and the project after it,
 * wrapping from the last to the first. Null when the slug isn't listed.
 */
export function getProjectPosition<T extends ProjectLinkTarget>(
	ordered: T[],
	slug: string,
): { position: number; total: number; next: ProjectLinkTarget | null } | null {
	const index = ordered.findIndex((project) => project.slug === slug);
	if (index === -1) return null;
	const after = ordered[(index + 1) % ordered.length];
	return {
		position: index + 1,
		total: ordered.length,
		next: ordered.length > 1 ? { slug: after.slug, title: after.title } : null,
	};
}

/**
 * Where the /projects scroll line sits, as a share of the viewport below the
 * sticky panel: the middle on wide screens, higher up on phones.
 */
export const INDEX_FOCUS_LINE = { wide: 0.5, narrow: 0.3 };

/**
 * Index of the box whose vertical centre is closest to `line`, a y position in
 * the viewport. 0 when there are no boxes.
 */
export function nearestIndex(
	boxes: { top: number; height: number }[],
	line: number,
): number {
	let nearest = 0;
	let best = Number.POSITIVE_INFINITY;
	boxes.forEach((box, index) => {
		const distance = Math.abs(box.top + box.height / 2 - line);
		if (distance < best) {
			best = distance;
			nearest = index;
		}
	});
	return nearest;
}

/** Steps a carousel by `delta`, wrapping at both ends. */
export function stepSlide(current: number, delta: number, count: number) {
	if (count <= 0) return 0;
	return (((current + delta) % count) + count) % count;
}

/** A two-digit counter: 1 → "01". */
export const padIndex = (n: number) => String(n).padStart(2, "0");

/** The year a project started: "2024-09-01" → "2024". */
export const getProjectYear = (startedAt: string) => startedAt.slice(0, 4);

/** A rectangle in CSS pixels, measured from the viewport's top-left corner. */
export interface Box {
	left: number;
	top: number;
	width: number;
	height: number;
}

/**
 * The area the full-screen viewer's image may fill: clear of the top bar and
 * the caption and dots, and from `md` of the side arrows. The same insets
 * as the classes in `ProjectGalleryViewer`.
 */
export function viewerStage(viewport: { width: number; height: number }): Box {
	const inset =
		viewport.width >= 768
			? { x: 96, top: 72, bottom: 112 }
			: { x: 16, top: 64, bottom: 136 };
	return {
		left: inset.x,
		top: inset.top,
		width: Math.max(0, viewport.width - inset.x * 2),
		height: Math.max(0, viewport.height - inset.top - inset.bottom),
	};
}

/**
 * The largest box with the image's aspect ratio that fits inside `stage`,
 * centred in it. Returns `stage` itself when either size has no area.
 */
export function fitContain(
	image: { width: number; height: number },
	stage: Box,
): Box {
	if (image.width <= 0 || image.height <= 0) return stage;
	if (stage.width <= 0 || stage.height <= 0) return stage;
	const scale = Math.min(
		stage.width / image.width,
		stage.height / image.height,
	);
	const width = image.width * scale;
	const height = image.height * scale;
	return {
		left: stage.left + (stage.width - width) / 2,
		top: stage.top + (stage.height - height) / 2,
		width,
		height,
	};
}

/**
 * Which way a horizontal drag of `dx` pixels steps the viewer: 1 for the next
 * image (a swipe left), -1 for the previous one, 0 when the drag is too short.
 */
export function swipeStep(dx: number, threshold = 48): -1 | 0 | 1 {
	if (dx <= -threshold) return 1;
	if (dx >= threshold) return -1;
	return 0;
}

/**
 * The project's external links that are set, labelled for display. The live
 * site comes first: it is the one the page shows as the solid button.
 */
export function getProjectLinks(
	project: Pick<Project, "githubUrl" | "liveUrl">,
): { label: string; href: string }[] {
	return [
		{ label: "live site", href: project.liveUrl },
		{ label: "github", href: project.githubUrl },
	].filter((link): link is { label: string; href: string } => !!link.href);
}

/**
 * When the project happened and whether it is done, for the case study's
 * "about" line: "Sep 2024 – now · ongoing", or just the status without dates.
 */
export function getProjectDateLine(
	project: Pick<Project, "status" | "startedAt" | "endedAt">,
): string {
	// An ongoing project without a start date already reads "ongoing".
	const parts = new Set([
		getProjectPeriodLabel(project),
		project.status.toLowerCase(),
	]);
	return [...parts].filter(Boolean).join(" · ");
}

export interface ProjectMetaRow {
	label: string;
	value: string;
}

/** A metadata value as display text, or null when it has nothing to show. */
function metadataText(value: unknown): string | null {
	if (typeof value === "string") return value.trim() || null;
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (Array.isArray(value)) {
		const parts = value.map(metadataText).filter((part) => part !== null);
		return parts.length ? parts.join(" · ") : null;
	}
	return null;
}

/**
 * The case-study label/value list, read from the project's `metadata` column.
 *
 * - An object maps labels to values: `{ "event": "Odyssey 2024" }`. Postgres
 *   `jsonb` doesn't keep key order (it stores shorter keys first), so use
 *   the list form when order matters.
 * - A list keeps its order: `[{ "label": "event", "value": "Odyssey 2024" }]`.
 *
 * Values may be text, numbers, booleans, or lists of those (joined with " · ").
 * Anything else, and empty values, is left out.
 */
export function getMetadataRows(metadata: unknown): ProjectMetaRow[] {
	const pairs: [unknown, unknown][] = Array.isArray(metadata)
		? metadata.map((entry) =>
				entry && typeof entry === "object"
					? [
							(entry as Record<string, unknown>).label,
							(entry as Record<string, unknown>).value,
						]
					: [null, null],
			)
		: metadata && typeof metadata === "object"
			? Object.entries(metadata)
			: [];

	return pairs.flatMap(([label, value]) => {
		const text = metadataText(value);
		return typeof label === "string" && label.trim() && text
			? [{ label: label.trim(), value: text }]
			: [];
	});
}

/** Featured projects in `featured` order, then the rest newest first. Returns a new array. */
export function orderProjects<T extends { slug: string; startedAt: string }>(
	projects: T[],
	featured: string[],
): T[] {
	// map out the featured projects
	const featuredRanked: Map<string, number> = new Map(
		featured.map((s, i) => [s, i]),
	);
	return [...projects].sort((a, b) => {
		const ra = featuredRanked.get(a.slug) ?? Number.POSITIVE_INFINITY;
		const rb = featuredRanked.get(b.slug) ?? Number.POSITIVE_INFINITY;
		if (ra !== rb) return ra - rb; // featured first, in featured order

		return b.startedAt.localeCompare(a.startedAt); // then newest first
	});
}

/* The project’s credits with each collaborator’s name and profile URL, in credit order; unknown slugs are skipped */
export function resolveCredits(
	credits: Project["credits"],
	collaborators: Collaborator[],
): ProjectCredit[] {
	const collaboratorsMap: Map<string, Collaborator> = new Map(
		collaborators.map((c) => [c.slug, c]),
	);

	return credits.flatMap((credit) => {
		const col = collaboratorsMap.get(credit.collaborator);
		if (!col) return [];
		return {
			name: col.name,
			role: credit.role ?? null,
			profileUrl: col.profileUrl ?? null,
		};
	});
}

/** The parts of a GSAP timeline the tools dialog drives. */
export interface ShutterTimeline {
	play(): unknown;
	reverse(): unknown;
	timeScale(value: number): unknown;
	time(): number;
}

/**
 * The tools dialog's answer to Base UI's `onOpenChange`. Opening (again, even
 * mid-close) plays the shutter forwards at normal speed. Closing keeps the
 * dialog mounted (`preventUnmount`) and plays it backwards at `closeSpeed`;
 * the timeline's `onReverseComplete` then unmounts it. With no timeline yet,
 * or one still at its start, there is nothing to play back (and GSAP never
 * fires `onReverseComplete` for a reverse from time 0), so Base UI closes on
 * its own.
 */
export function playToolsShutter(
	open: boolean,
	timeline: ShutterTimeline | null,
	preventUnmount: () => void,
	closeSpeed: number,
) {
	if (!timeline) return;
	if (!open && timeline.time() === 0) return;
	if (open) {
		timeline.timeScale(1);
		timeline.play();
		return;
	}
	preventUnmount();
	timeline.timeScale(closeSpeed);
	timeline.reverse();
}

/** The shutter timeline's settings: built paused, and unmounted once it has run backwards. */
export function toolsShutterVars(unmount: () => void) {
	return { paused: true, onReverseComplete: unmount };
}
