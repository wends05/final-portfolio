import { ArrowsOutSimpleIcon } from "@phosphor-icons/react/ssr";
import { useMemo, useRef, useState } from "react";
import { cn } from "#/lib/utils";
import type { ProjectImageView } from "../projects.types";
import ProjectGalleryViewer from "./ProjectGalleryViewer";

interface ProjectCoverProps {
	title: string;
	cover: ProjectImageView["image"];
}

/**
 * The case study's cover in its 4:3 frame. Pressing it opens the full-screen
 * viewer on the cover alone, which grows from this frame and returns to it,
 * the way the gallery's does. The frame's own image stays hidden while the
 * viewer is up or flying back, so it is never drawn twice.
 */
export default function ProjectCover({ title, cover }: ProjectCoverProps) {
	const [viewing, setViewing] = useState(false);
	// The viewer is still flying back to the frame.
	const [leaving, setLeaving] = useState(false);
	const frame = useRef<HTMLDivElement>(null);
	const alt = `Cover of ${title}`;
	const images = useMemo(() => [{ image: cover, alt }], [cover, alt]);

	return (
		<div ref={frame} className="relative aspect-4/3 overflow-hidden bg-muted">
			<img
				src={cover.src}
				alt={alt}
				className={cn(
					"absolute inset-0 size-full object-cover",
					(viewing || leaving) && "invisible",
				)}
			/>
			<button
				type="button"
				aria-label="View cover full screen"
				aria-haspopup="dialog"
				onClick={() => setViewing(true)}
				className="group focus-ring absolute inset-0 cursor-zoom-in"
			>
				<span
					aria-hidden
					className="absolute right-3 bottom-3 inline-flex size-11 items-center justify-center border border-rule bg-background text-foreground transition-colors duration-150 ease-swiss group-hover:bg-primary group-hover:text-primary-foreground"
				>
					<ArrowsOutSimpleIcon className="size-5" />
				</span>
			</button>

			<ProjectGalleryViewer
				label="cover"
				title={title}
				images={images}
				open={viewing}
				index={0}
				onIndexChange={() => {}}
				onClose={() => {
					setViewing(false);
					setLeaving(true);
				}}
				onExited={() => setLeaving(false)}
				getOriginRect={() => frame.current?.getBoundingClientRect() ?? null}
			/>
		</div>
	);
}
