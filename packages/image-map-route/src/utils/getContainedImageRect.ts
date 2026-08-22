export function getContainedImageRect(containerSize: DOMRect, imageAspectRatio?: number) {
	if (!imageAspectRatio || imageAspectRatio <= 0) return containerSize;

	const containerAspectRatio = containerSize.width / containerSize.height;
	const width =
		containerAspectRatio > imageAspectRatio
			? containerSize.height * imageAspectRatio
			: containerSize.width;
	const height =
		containerAspectRatio > imageAspectRatio
			? containerSize.height
			: containerSize.width / imageAspectRatio;

	return new DOMRect(
		(containerSize.width - width) / 2,
		(containerSize.height - height) / 2,
		width,
		height,
	);
}
