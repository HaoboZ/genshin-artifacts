export default async function fileToCanvas(file: File, canvas?: HTMLCanvasElement) {
	return new Promise<HTMLCanvasElement>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const img = new Image();
			img.onload = async () => {
				if (!canvas) canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);
				resolve(canvas);
			};
			img.onerror = reject;
			img.src = e.target.result as string;
		};
		reader.readAsDataURL(file);
	});
}
