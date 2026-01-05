export default function preprocessImage(canvas: HTMLCanvasElement) {
	const image = cv.imread(canvas);
	const result = cv.Mat.zeros(image.rows, image.cols, cv.CV_8UC1);

	cv.Canny(image, result, 50, 100);
	const lines = new cv.Mat();
	cv.HoughLinesP(result, lines, 1, Math.PI / 2, 40, 20, 10);
	result.setTo(new cv.Scalar(0));

	for (let i = 0; i < lines.rows; ++i) {
		const startPoint = new cv.Point(lines.data32S[i * 4], lines.data32S[i * 4 + 1]);
		const endPoint = new cv.Point(lines.data32S[i * 4 + 2], lines.data32S[i * 4 + 3]);
		cv.line(result, startPoint, endPoint, new cv.Scalar(255));
	}
	lines.delete();

	return [image, result];
}
