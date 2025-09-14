import type { CV } from 'mirada';

export default async function crop(canvas: HTMLCanvasElement) {
	const cv: CV = window.cv;
	const image = cv.imread(canvas);

	// Convert to grayscale
	const gray = new cv.Mat();
	cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);

	// Apply Canny edge detector
	const edges = new cv.Mat();
	cv.Canny(gray, edges, 100, 300, 3);
	gray.delete();

	// Apply morphological operations to clean up the edges
	const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
	const morphed = new cv.Mat();
	cv.morphologyEx(edges, morphed, cv.MORPH_CLOSE, kernel);
	kernel.delete();
	edges.delete();

	// Find Contours
	const contours = new cv.MatVector();
	const hierarchy = new cv.Mat();
	cv.findContours(morphed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
	hierarchy.delete();
	morphed.delete();

	// Filter contours to find rectangles
	let boundingRect = null;
	let height = 0;
	const approx = new cv.Mat();
	for (let i = 0; i < (contours.size() as any); i++) {
		const cnt = contours.get(i);
		cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);
		// Get the bounding rectangle
		const rect = cv.boundingRect(approx);
		const aspectRatio = rect.width / rect.height;
		if (rect.height > 300 && rect.height > height && 0.55 < aspectRatio && aspectRatio < 0.6) {
			boundingRect = rect;
			height = rect.height;
		}
	}
	approx.delete();
	contours.delete();

	const box = image.roi(boundingRect);
	const newCanvas = document.createElement('canvas');
	cv.imshow(newCanvas, box);
	box.delete();

	image.delete();
	return newCanvas;
}
