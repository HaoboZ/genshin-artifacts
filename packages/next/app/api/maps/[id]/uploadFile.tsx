import { Button } from '@mui/material';

import useAsyncLoading from '@/components/loaders/useAsyncLoading';

export default function UploadFile({
	onUpload,
	multiple,
}: {
	onUpload: (data: FormData | File, videoDuration?: number) => Promise<void>;
	multiple?: boolean;
}) {
	const [loading, onChangeLoading] = useAsyncLoading();

	const getVideoDuration = (file: File) =>
		new Promise<number>((resolve, reject) => {
			const video = document.createElement('video');
			const url = URL.createObjectURL(file);
			video.preload = 'metadata';
			video.onloadedmetadata = () => {
				URL.revokeObjectURL(url);
				resolve(video.duration);
			};
			video.onerror = () => {
				URL.revokeObjectURL(url);
				reject(new Error('Unable to read video duration'));
			};
			video.src = url;
		});

	return (
		<Button component='label' variant='contained' loading={loading}>
			Upload Image/Video
			<input
				hidden
				type='file'
				accept='.json, image/*, video/*'
				multiple={multiple}
				onChange={onChangeLoading(async (e) => {
					const files = e.target.files;
					if (!files?.length) throw Error('No File Uploaded');

					if (multiple) {
						const formData = new FormData();
						const selectedFiles = Array.from(files);
						selectedFiles.forEach((file) => formData.append('file', file));
						const videoFile = selectedFiles.find((file) => file.type.startsWith('video/'));
						await onUpload(
							formData,
							videoFile ? await getVideoDuration(videoFile) : undefined,
						);
					} else {
						await onUpload(files[0]);
					}
				})}
			/>
		</Button>
	);
}
