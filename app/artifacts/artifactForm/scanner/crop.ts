import type { CV } from 'mirada';

export default async function crop(canvas: HTMLCanvasElement) {
	const cv: CV = await window.cv;
	const image = cv.imread(canvas);
	const gray = new cv.Mat();
	cv.cvtColor(image, gray, cv.COLOR_RGBA2GRAY);
	const edges = new cv.Mat();
	cv.Canny(gray, edges, 100, 200, 3);
	const contours = new cv.MatVector();
	const hierarchy = new cv.Mat();
	cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
	let boxContour = null;
	let height = 0;
	for (let i = 0; i < (contours.size() as any); i++) {
		const cnt = contours.get(i);
		const rect = cv.boundingRect(cnt);
		if (
			rect.height > height &&
			rect.height * 0.55 < rect.width &&
			rect.width < rect.height * 0.6
		) {
			boxContour = cnt;
			height = rect.height;
		}
	}
	if (!boxContour) throw 'Not found';

	const box = image.roi(cv.boundingRect(boxContour));
	const newCanvas = document.createElement('canvas');
	cv.imshow(newCanvas, box);
	const gray2 = new cv.Mat();
	cv.cvtColor(box, gray2, cv.COLOR_RGBA2GRAY);
	cv.imshow(canvas, gray2);

	image.delete();
	gray.delete();
	edges.delete();
	contours.delete();
	hierarchy.delete();
	box.delete();
	gray2.delete();
	return newCanvas;
}
