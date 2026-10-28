import { Dialog } from "@base-ui/react/dialog";
import { XIcon } from "@phosphor-icons/react/ssr";
import { useRef, useState } from "react";
import { appGSAP, useAppGSAP } from "#/integrations/animations/gsap";
import { matchMotion } from "#/integrations/animations/motion";
import { playToolsShutter, toolsShutterVars } from "../projects.utils";
import ProjectToolsGrid from "./ProjectToolsGrid";

type Timeline = ReturnType<typeof appGSAP.timeline>;

interface ProjectToolsDialogProps {
	title: string;
	tools: string[];
}

/** Seconds. The close plays the same timeline backwards, faster. */
const TIMING = {
	blur: 0.3,
	hairline: 0.35,
	open: 0.5,
	rules: 0.4,
	rulesSpread: 0.35,
	names: 0.3,
	reducedFade: 0.2,
	closeSpeed: 1.6,
};

const closeButton =
	"inline-flex size-11 shrink-0 items-center justify-center border border-rule bg-background text-foreground outline-none transition-colors duration-150 ease-swiss hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2";

/**
 * The case study's "show all N" button and the window it opens: every tool in
 * a paper window over the blurred page. The window opens as a shutter (a
 * hairline across the middle that opens up and down, then each tool's rule
 * and name), and closing plays it backwards into the line. With reduced
 * motion it only fades.
 *
 * Closing goes through Base UI's closing phase: the dialog is closed at once,
 * so the page is usable again, and stays mounted until the timeline has run
 * backwards and calls `unmount()`.
 */
export default function ProjectToolsDialog({
	title,
	tools,
}: ProjectToolsDialogProps) {
	const [open, setOpen] = useState(false);
	const actions = useRef<Dialog.Root.Actions>(null);
	const timeline = useRef<Timeline | null>(null);
	const backdrop = useRef<HTMLDivElement>(null);
	// The portal mounts the popup a render after `open`; the timeline waits for it.
	const [popup, setPopup] = useState<HTMLDivElement | null>(null);

	useAppGSAP(
		() => {
			if (!popup) return;
			const blur = backdrop.current;

			matchMotion(({ reduce }) => {
				const tl = appGSAP.timeline(
					toolsShutterVars(() => actions.current?.unmount()),
				);

				if (reduce) {
					appGSAP.set("[data-tools-hairline]", { autoAlpha: 0 });
					tl.fromTo(
						[blur, popup],
						{ autoAlpha: 0 },
						{ autoAlpha: 1, duration: TIMING.reducedFade, ease: "none" },
					);
				} else {
					tl.fromTo(
						blur,
						{ autoAlpha: 0 },
						{ autoAlpha: 1, duration: TIMING.blur, ease: "none" },
					)
						// the hairline draws across the middle
						.fromTo(
							"[data-tools-hairline]",
							{ scaleX: 0, autoAlpha: 1 },
							{ scaleX: 1, duration: TIMING.hairline, ease: "swiss" },
							0,
						)
						// the window opens up and down from it
						.fromTo(
							"[data-tools-window]",
							{ clipPath: "inset(50% 0% 50% 0%)" },
							{
								clipPath: "inset(0% 0% 0% 0%)",
								duration: TIMING.open,
								ease: "curtain",
							},
						)
						.to("[data-tools-hairline]", { autoAlpha: 0, duration: 0.1 }, "<")
						// each tool's rule draws left to right, and its name follows
						.fromTo(
							"[data-tool-rule]",
							{ scaleX: 0 },
							{
								scaleX: 1,
								duration: TIMING.rules,
								ease: "swiss",
								stagger: { amount: TIMING.rulesSpread },
							},
							"-=0.15",
						)
						.fromTo(
							"[data-tool-name]",
							{ autoAlpha: 0, y: 6 },
							{
								autoAlpha: 1,
								y: 0,
								duration: TIMING.names,
								ease: "swiss",
								stagger: { amount: TIMING.rulesSpread },
							},
							"<+=0.12",
						);
				}

				timeline.current = tl;
				tl.play();
				return () => {
					timeline.current = null;
				};
			});
		},
		// String targets are scoped to the popup.
		{ dependencies: [popup], scope: popup ?? undefined },
	);

	return (
		<Dialog.Root
			open={open}
			actionsRef={actions}
			onOpenChange={(next, details) => {
				setOpen(next);
				playToolsShutter(
					next,
					timeline.current,
					details.preventUnmountOnClose,
					TIMING.closeSpeed,
				);
			}}
		>
			<Dialog.Trigger className="type-label -my-2 inline-flex min-h-11 items-center underline-offset-4 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-ring">
				show all {tools.length}
			</Dialog.Trigger>
			<Dialog.Portal>
				{/* While it closes, clicks go through to the page, the trigger included. */}
				<Dialog.Backdrop
					ref={backdrop}
					className="fixed inset-0 z-50 bg-background/40 backdrop-blur-sm data-closed:pointer-events-none"
				/>
				<Dialog.Popup
					ref={setPopup}
					className="fixed inset-x-4 top-1/2 z-50 flex max-h-4/5 -translate-y-1/2 outline-none data-closed:pointer-events-none md:inset-x-12 lg:inset-x-24"
				>
					<span
						data-tools-hairline
						aria-hidden
						className="invisible absolute inset-x-0 top-1/2 h-px bg-rule"
					/>
					<div
						data-tools-window
						className="flex min-h-0 w-full flex-col border border-rule bg-background text-foreground"
					>
						<div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
							<Dialog.Title className="type-label truncate">
								tools<span className="max-md:hidden"> · {title}</span>
							</Dialog.Title>
							<Dialog.Close aria-label="Close tools" className={closeButton}>
								<XIcon aria-hidden className="size-5" />
							</Dialog.Close>
						</div>
						<ProjectToolsGrid tools={tools} />
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
