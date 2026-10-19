import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

const progressValueVariants = cva("ml-auto text-muted-foreground", {
	variants: {
		variant: {
			default: "text-xs/relaxed tabular-nums",
			// type-meta sets the mono family and its own size (12px, 13px from md).
			meta: "type-meta leading-relaxed",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

function Progress({
	className,
	children,
	value,
	...props
}: ProgressPrimitive.Root.Props) {
	return (
		<ProgressPrimitive.Root
			value={value}
			data-slot="progress"
			className={cn("flex flex-wrap gap-3", className)}
			{...props}
		>
			{children}
			<ProgressTrack>
				<ProgressIndicator />
			</ProgressTrack>
		</ProgressPrimitive.Root>
	);
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
	return (
		<ProgressPrimitive.Track
			className={cn(
				"relative flex h-1 w-full items-center overflow-x-hidden rounded-md bg-muted",
				className,
			)}
			data-slot="progress-track"
			{...props}
		/>
	);
}

function ProgressIndicator({
	className,
	...props
}: ProgressPrimitive.Indicator.Props) {
	return (
		<ProgressPrimitive.Indicator
			data-slot="progress-indicator"
			className={cn("h-full bg-primary transition-all", className)}
			{...props}
		/>
	);
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
	return (
		<ProgressPrimitive.Label
			className={cn("font-medium text-xs/relaxed", className)}
			data-slot="progress-label"
			{...props}
		/>
	);
}

function ProgressValue({
	className,
	variant = "default",
	...props
}: ProgressPrimitive.Value.Props & VariantProps<typeof progressValueVariants>) {
	return (
		<ProgressPrimitive.Value
			className={cn(progressValueVariants({ variant, className }))}
			data-slot="progress-value"
			{...props}
		/>
	);
}

export {
	Progress,
	ProgressIndicator,
	ProgressLabel,
	ProgressTrack,
	ProgressValue,
};
