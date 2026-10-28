import {
	ArrowsOutSimpleIcon,
	CaretLeftIcon,
	CaretRightIcon,
} from "@phosphor-icons/react/ssr";
import { useRef, useState } from "react";
import { cn } from "#/lib/utils";
import type { ProjectImageView } from "../projects.types";
import { padIndex, stepSlide } from "../projects.utils";
import ProjectGalleryViewer from "./ProjectGalleryViewer";

interface ProjectGalleryProps {
	title: string;
	images: ProjectImageView[];
	className?: string;
	/** Rises in with the page entrance. */
	entrance?: boolean;
}

const navButton =
	"inline-flex size-11 items-center justify-center border border-rule bg-background text-foreground outline-none transition-colors duration-150 ease-swiss hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2";

/**
 * The case study's gallery: the `ProjectImage` rows, one at a time, with the
 * counter and ‹ › buttons on its heading row and the image's alt text as the
 * caption. Slides change instantly. The expand button after them opens the
 * full-screen view, which shows the images uncropped. With one image there is
 * only the expand button.
 */
export default function ProjectGallery({
	title,
	images,
	className,
	entrance,
}: ProjectGalleryProps) {
	const [slide, setSlide] = useState(0);
	const [viewing, setViewing] = useState(false);
	// The viewer is still flying back to the frame: keep the frame's image hidden until it lands.
	const [leaving, setLeaving] = useState(false);
	const frame = useRef<HTMLDivElement>(null);
	const count = images.length;
	if (count === 0) return null;
	const counter = `${padIndex(slide + 1)} / ${padIndex(count)}`;

	return (
		<section
			aria-roledescription="carousel"
			aria-label={`Gallery of ${title}`}
			data-entrance={entrance || undefined}
			className={className}
		>
			<div className="flex min-h-11 items-center justify-between gap-4 border-rule border-b pb-3">
				<h2 className="type-label">gallery</h2>
				<div className="flex items-center gap-1">
					{count > 1 && (
						<>
							<p
								aria-live="polite"
								className="type-label mr-2 bg-primary px-1.5 py-1 text-primary-foreground"
							>
								{counter}
							</p>
							<button
								type="button"
								aria-label="Previous image"
								onClick={() => setSlide((s) => stepSlide(s, -1, count))}
								className={navButton}
							>
								<CaretLeftIcon aria-hidden className="size-5" />
							</button>
							<button
								type="button"
								aria-label="Next image"
								onClick={() => setSlide((s) => stepSlide(s, 1, count))}
								className={navButton}
							>
								<CaretRightIcon aria-hidden className="size-5" />
							</button>
						</>
					)}
					<button
						type="button"
						aria-label="View full screen"
						aria-haspopup="dialog"
						onClick={() => setViewing(true)}
						className={cn(navButton, count > 1 && "ml-2")}
					>
						<ArrowsOutSimpleIcon aria-hidden className="size-5" />
					</button>
				</div>
			</div>

			{/* Edge to edge on phones. */}
			<div
				ref={frame}
				className="relative mt-4 aspect-4/3 overflow-hidden bg-muted max-md:-mx-4 md:aspect-21/9"
			>
				{images.map((shot, i) => (
					<div
						key={shot.image.src}
						inert={i !== slide}
						className={cn(
							"absolute inset-0",
							(i !== slide || viewing || leaving) && "invisible",
						)}
					>
						<img
							src={shot.image.src}
							alt={shot.alt}
							loading={i === 0 ? "eager" : "lazy"}
							className="size-full object-cover"
						/>
					</div>
				))}
			</div>

			{/* On phones the counter takes its own line so it never wraps beside the caption. */}
			<p className="type-meta mt-2.5 flex flex-col gap-1 md:flex-row md:gap-2.5">
				{count > 1 && (
					<b className="shrink-0 whitespace-nowrap font-semibold">{counter}</b>
				)}
				<span className="text-muted-foreground">{images[slide].alt}</span>
			</p>

			<ProjectGalleryViewer
				title={title}
				images={images}
				open={viewing}
				index={slide}
				onIndexChange={setSlide}
				onClose={() => {
					setViewing(false);
					setLeaving(true);
				}}
				onExited={() => setLeaving(false)}
				getOriginRect={() => frame.current?.getBoundingClientRect() ?? null}
			/>
		</section>
	);
}
