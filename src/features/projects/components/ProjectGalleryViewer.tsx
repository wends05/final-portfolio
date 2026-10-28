import { Dialog } from "@base-ui/react/dialog";
import {
	CaretLeftIcon,
	CaretRightIcon,
	XIcon,
} from "@phosphor-icons/react/ssr";
import {
	type CSSProperties,
	useCallback,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { cn } from "#/lib/utils";
import type { ProjectImageView } from "../projects.types";
import {
	type Box,
	fitContain,
	padIndex,
	stepSlide,
	swipeStep,
	viewerStage,
} from "../projects.utils";

interface ProjectGalleryViewerProps {
	title: string;
	images: ProjectImageView[];
	/** What the viewer is showing, in its top-left title: "gallery" or "cover". */
	label?: string;
	/** The viewer is wanted. It stays on screen until its exit finishes. */
	open: boolean;
	/** The image on show, shared with the page's gallery. */
	index: number;
	onIndexChange: (index: number) => void;
	/** The user asked to close: the close button, Esc, or a click outside the image. */
	onClose: () => void;
	/** The exit finished and the viewer is gone. */
	onExited: () => void;
	/** Where the page shows the image now: the viewer grows from it and returns to it. */
	getOriginRect: () => DOMRect | null;
}

type Phase = "closed" | "entering" | "open" | "leaving";

const OPEN_MS = 520;
const CLOSE_MS = 420;
/** `--ease-swiss`, as WAAPI needs it spelled out. */
const EASE = "cubic-bezier(0.2, 0, 0, 1)";

const toFrame = (box: Box) => ({
	left: `${box.left}px`,
	top: `${box.top}px`,
	width: `${box.width}px`,
	height: `${box.height}px`,
});

/* The controls fade in after the image starts to move, one group after the
 * other, and out together and fast. `group/viewer` is the popup. */
const fade =
	"opacity-0 duration-150 ease-swiss motion-reduce:transition-none group-data-[phase=open]/viewer:opacity-100 group-data-[phase=open]/viewer:duration-300";
const fadeTop = cn(
	fade,
	"transition-opacity group-data-[phase=open]/viewer:delay-200",
);
const fadeBottom = cn(
	fade,
	"transition-opacity group-data-[phase=open]/viewer:delay-400",
);
const viewerButton =
	"pointer-events-auto inline-flex size-12 shrink-0 items-center justify-center border border-inverse-foreground/50 bg-inverse/55 text-inverse-foreground outline-none transition-fade-colors hover:bg-inverse-foreground hover:text-inverse focus-visible:outline-2 focus-visible:outline-inverse-foreground focus-visible:outline-offset-2";
const arrowButton = cn(
	viewerButton,
	fade,
	"group-data-[phase=open]/viewer:delay-300 md:fixed md:top-1/2 md:-translate-y-1/2",
);

/**
 * The full-screen gallery. The image on show grows from where the page
 * displays it, uncropped, while the page darkens behind it; then the counter,
 * the arrows, the caption and the dots fade in. Closing runs it backwards.
 *
 * The page's gallery owns `open` and `index`. The viewer keeps its own phase
 * so it stays mounted while the image flies back.
 */
export default function ProjectGalleryViewer({
	title,
	images,
	label = "gallery",
	open,
	index,
	onIndexChange,
	onClose,
	onExited,
	getOriginRect,
}: ProjectGalleryViewerProps) {
	const [phase, setPhase] = useState<Phase>("closed");
	const [viewport, setViewport] = useState({ width: 1280, height: 800 });
	// The portal mounts its children a render after `open`; the flight waits for them.
	const [popupMounted, setPopupMounted] = useState(false);
	const popup = useCallback(
		(element: HTMLDivElement | null) => setPopupMounted(!!element),
		[],
	);
	const shots = useRef<(HTMLImageElement | null)[]>([]);
	const closeButton = useRef<HTMLButtonElement>(null);
	const flight = useRef<Animation | null>(null);
	const swipeFrom = useRef<number | null>(null);
	// The flight reads these when the phase changes, not when they change.
	const live = useRef({ images, index, getOriginRect, onExited });
	live.current = { images, index, getOriginRect, onExited };
	const count = images.length;
	const mounted = phase !== "closed";

	// The phase follows `open`; adjusting it while rendering mounts the images
	// already in the entering state.
	if (open && phase === "closed") setPhase("entering");
	if (!open && (phase === "entering" || phase === "open")) setPhase("leaving");

	useLayoutEffect(() => {
		if (!mounted) return;
		const update = () =>
			setViewport({ width: window.innerWidth, height: window.innerHeight });
		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, [mounted]);

	// The flight between the page's image and the full-screen one. It outlives
	// the entering phase (the phase moves on a frame after it starts), so only
	// the next flight, or the end of the exit, cancels it.
	useLayoutEffect(() => {
		if (phase !== "entering" && phase !== "leaving") return;
		if (!popupMounted) return;
		const { images, index, getOriginRect, onExited } = live.current;
		const shot = shots.current[index];
		const origin = getOriginRect();
		const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		const fly = !!shot && !!origin && !still;
		// Where the image is now, even mid-flight, before that flight is replaced.
		const now = shot?.getBoundingClientRect();
		flight.current?.cancel();
		flight.current = null;

		if (phase === "entering") {
			const target = fitContain(
				images[index].image,
				viewerStage({
					width: window.innerWidth,
					height: window.innerHeight,
				}),
			);
			if (fly) {
				flight.current = shot.animate([toFrame(origin), toFrame(target)], {
					duration: OPEN_MS,
					easing: EASE,
				});
			}
			// One frame in the entering state, so the controls have something to fade from.
			const frame = requestAnimationFrame(() =>
				setPhase((current) => (current === "entering" ? "open" : current)),
			);
			return () => cancelAnimationFrame(frame);
		}

		if (fly && now) {
			flight.current = shot.animate([toFrame(now), toFrame(origin)], {
				duration: CLOSE_MS,
				easing: EASE,
				fill: "forwards",
			});
		}
		const timer = window.setTimeout(
			() => {
				flight.current = null;
				setPhase("closed");
				onExited();
			},
			still ? 0 : CLOSE_MS,
		);
		return () => window.clearTimeout(timer);
	}, [phase, popupMounted]);

	const stage = viewerStage(viewport);
	const activeBox = images[index] && fitContain(images[index].image, stage);
	const counter = `${padIndex(index + 1)} / ${padIndex(count)}`;
	const step = (delta: number) => onIndexChange(stepSlide(index, delta, count));

	return (
		<Dialog.Root
			open={mounted}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<Dialog.Portal>
				<Dialog.Popup
					ref={popup}
					data-phase={phase}
					data-lenis-prevent
					initialFocus={closeButton}
					onKeyDown={(event) => {
						if (count < 2) return;
						if (event.key === "ArrowLeft") step(-1);
						if (event.key === "ArrowRight") step(1);
					}}
					onPointerDown={(event) => {
						swipeFrom.current =
							event.pointerType === "mouse" ? null : event.clientX;
					}}
					onPointerUp={(event) => {
						const from = swipeFrom.current;
						swipeFrom.current = null;
						if (from === null || count < 2) return;
						const delta = swipeStep(event.clientX - from);
						if (delta) step(delta);
					}}
					className="group/viewer fixed inset-0 z-50 touch-pan-y text-inverse-foreground outline-none"
				>
					{/* The page, darkened. A click on it, anywhere outside the image, closes. */}
					<div
						aria-hidden
						onClick={onClose}
						className="absolute inset-0 bg-inverse opacity-0 backdrop-blur-xs transition-opacity duration-300 ease-swiss group-data-[phase=open]/viewer:opacity-60 motion-reduce:transition-none"
					/>

					{images.map((shot, i) => {
						const box = fitContain(shot.image, stage);
						const active = i === index;
						return (
							<div key={shot.image.src} className="relative">
								<img
									ref={(element) => {
										shots.current[i] = element;
									}}
									src={shot.image.src}
									alt={shot.alt}
									inert={!active}
									decoding="async"
									style={
										{
											"--box-left": `${box.left}px`,
											"--box-top": `${box.top}px`,
											"--box-width": `${box.width}px`,
											"--box-height": `${box.height}px`,
										} as CSSProperties
									}
									className={cn(
										"absolute top-(--box-top) left-(--box-left) h-(--box-height) w-(--box-width) max-w-none object-cover transition-fade-rise duration-300 ease-swiss motion-reduce:transition-none",
										active
											? "opacity-100"
											: cn(
													"opacity-0",
													i < index ? "-translate-x-6" : "translate-x-6",
												),
									)}
								/>
							</div>
						);
					})}

					{/* The caption sits in the lower left corner of the image on show. The
					 * image's own `alt` already speaks to screen readers. */}
					{activeBox && (
						<p
							aria-hidden
							style={
								{
									"--caption-left": `calc(${activeBox.left}px + 0.75rem)`,
									"--caption-bottom": `calc(${viewport.height - activeBox.top - activeBox.height}px + 0.75rem)`,
									"--caption-width": `min(32rem, calc(${activeBox.width}px - 1.5rem))`,
								} as CSSProperties
							}
							className={cn(
								"type-meta absolute bottom-(--caption-bottom) left-(--caption-left) max-w-(--caption-width) bg-inverse/70 px-2 py-1 text-inverse-foreground",
								fadeBottom,
							)}
						>
							{images[index]?.alt}
						</p>
					)}

					<div
						className={cn(
							"pointer-events-none absolute inset-x-0 top-0 flex h-16 items-center justify-between gap-4 px-4 md:h-18 md:px-6",
							fadeTop,
						)}
					>
						<Dialog.Title className="type-label truncate">
							{label}
							<span className="max-md:hidden"> · {title}</span>
						</Dialog.Title>
						<div className="flex shrink-0 items-center gap-3">
							{count > 1 && (
								<p
									aria-live="polite"
									className="type-label bg-inverse-foreground px-1.5 py-1 text-inverse"
								>
									{counter}
								</p>
							)}
							<Dialog.Close
								ref={closeButton}
								aria-label="Close full screen"
								className={viewerButton}
							>
								<XIcon aria-hidden className="size-5" />
							</Dialog.Close>
						</div>
					</div>

					<div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-34 flex-col items-center justify-center gap-2.5 px-4 md:h-28">
						{count > 1 && (
							<div className="flex w-full items-center justify-between md:justify-center">
								<button
									type="button"
									aria-label="Previous image"
									onClick={() => step(-1)}
									className={cn(arrowButton, "md:left-6")}
								>
									<CaretLeftIcon aria-hidden className="size-5" />
								</button>
								<fieldset
									className={cn(
										"pointer-events-auto m-0 flex min-w-0 border-0 p-0",
										fadeBottom,
									)}
								>
									<legend className="sr-only">Choose an image</legend>
									{images.map((shot, i) => (
										<button
											key={shot.image.src}
											type="button"
											aria-label={`Show image ${i + 1}`}
											aria-current={i === index}
											onClick={() => onIndexChange(i)}
											className="flex h-11 items-center px-1.75 outline-none focus-visible:outline-2 focus-visible:outline-inverse-foreground"
										>
											<span
												className={cn(
													"block h-2.5 border border-inverse-foreground transition-dot duration-300 ease-swiss motion-reduce:transition-none",
													i === index ? "w-7 bg-inverse-foreground" : "w-2.5",
												)}
											/>
										</button>
									))}
								</fieldset>
								<button
									type="button"
									aria-label="Next image"
									onClick={() => step(1)}
									className={cn(arrowButton, "md:right-6")}
								>
									<CaretRightIcon aria-hidden className="size-5" />
								</button>
							</div>
						)}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
