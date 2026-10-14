import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { cn } from "#/lib/utils";
import type { ProjectImageView } from "../projects.types";
import { padIndex, stepSlide } from "../projects.utils";

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
 * caption. Slides change instantly. With one image there are no controls.
 */
export default function ProjectGallery({
	title,
	images,
	className,
	entrance,
}: ProjectGalleryProps) {
	const [slide, setSlide] = useState(0);
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
				{count > 1 && (
					<div className="flex items-center gap-1">
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
					</div>
				)}
			</div>

			{/* Edge to edge on phones. */}
			<div className="relative mt-4 aspect-4/3 overflow-hidden bg-muted max-md:-mx-4 md:aspect-21/9">
				{images.map((image, i) => (
					<div
						key={image.url}
						inert={i !== slide}
						className={cn("absolute inset-0", i !== slide && "invisible")}
					>
						<img
							src={image.url}
							alt={image.alt}
							loading={i === 0 ? "eager" : "lazy"}
							className="size-full object-cover"
						/>
					</div>
				))}
			</div>

			<p className="type-meta mt-2.5 flex gap-2.5">
				{count > 1 && <b className="font-semibold">{counter}</b>}
				<span className="text-muted-foreground">{images[slide].alt}</span>
			</p>
		</section>
	);
}
