import useAsyncLoading from '@/components/loaders/useAsyncLoading';
import { Button } from '@mui/material';

export default function UploadFile({
	onUpload,
	multiple,
}: {
	onUpload: (data: FormData | File) => Promise<void>;
	multiple?: boolean;
}) {
	const [loading, onChangeLoading] = useAsyncLoading();

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
						Array.from(files).forEach((file) => formData.append('file', file));
						await onUpload(formData);
					} else {
						await onUpload(files[0]);
					}
				})}
			/>
		</Button>
	);
}
