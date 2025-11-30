import { Mat, Rect } from 'mirada';

export default function cropBox([image, processed]: Mat[], canvas: HTMLCanvasElement) {
	const contours = new cv.MatVector();
	const hierarchy = new cv.Mat();
	cv.findContours(processed, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
	hierarchy.delete();
	processed.delete();

	let largestRect: Rect = null;
	let largestArea = 0;
	for (let i = 0; i < (contours.size() as any); i++) {
		const contour = contours.get(i);
		const rect = cv.boundingRect(contour);

		if (rect.height < image.rows / 2) continue;
		const aspectRatio = rect.width / rect.height;
		if (aspectRatio < 0.5 || aspectRatio > 0.7) continue;

		const area = rect.width * rect.height;
		if (area > largestArea) {
			largestArea = area;
			largestRect = rect;
		}
	}
	contours.delete();

	if (!largestRect) throw Error('No artifact found');

	const box = image.roi(largestRect);
	image.delete();

	cv.imshow(canvas, box);
	box.delete();
}
