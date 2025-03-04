import type { CV } from 'mirada';

export default async function crop(canvas: HTMLCanvasElement) {
	const cv: CV = await window.cv;
	const image = cv.imread(canvas);

	// Convert to grayscale
	const gray = new cv.Mat();
	cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);

	// // Apply GaussianBlur to reduce noise and improve edge detection
	// const blurred = new cv.Mat();
	// cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

	// Apply Canny edge detector
	const edges = new cv.Mat();
	cv.Canny(gray, edges, 50, 150, 3);

	// // Apply morphological operations to clean up the edges
	// const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
	// const morphed = new cv.Mat();
	// cv.morphologyEx(edges, morphed, cv.MORPH_CLOSE, kernel);

	// Find Contours
	const contours = new cv.MatVector();
	const hierarchy = new cv.Mat();
	cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

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

	const box = image.roi(boundingRect);
	const newCanvas = document.createElement('canvas');
	cv.imshow(newCanvas, box);
	const gray2 = new cv.Mat();
	cv.cvtColor(box, gray2, cv.COLOR_RGBA2GRAY);
	cv.imshow(canvas, gray2);

	image.delete();
	gray.delete();
	// blurred.delete();
	edges.delete();
	// morphed.delete();
	contours.delete();
	hierarchy.delete();
	box.delete();
	gray2.delete();
	return newCanvas;
}
