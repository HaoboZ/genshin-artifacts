import useClipboardImage from '@/src/hooks/useClipboardImage';
import type { IArtifact } from '@/src/types/good';
import { LoadingButton } from '@mui/lab';
import { CircularProgress } from '@mui/material';
import Script from 'next/script';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import crop from './crop';
import match from './match';
import rarity from './rarity';
import text from './text';

export default function Scanner({
	setArtifact,
}: {
	setArtifact: Dispatch<SetStateAction<IArtifact>>;
}) {
	const [progress, setProgress] = useState(0);

	const scanFile = useCallback((file: File) => {
		setProgress(1);
		const reader = new FileReader();
		reader.onload = ({ target }) => {
			const img = new Image();
			img.onload = async () => {
				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d', { willReadFrequently: true });
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				try {
					await crop(canvas);
					const misMatch = await match(canvas);
					if (misMatch > 20000) throw 'No matches';

					const artifact = await text(canvas, setProgress);
					artifact.rarity = rarity(canvas);
					setArtifact(artifact);
				} catch (e) {
					console.log(e);
				}
				setProgress(0);
			};
			img.src = target.result as string;
		};
		reader.readAsDataURL(file);
	}, []);

	useClipboardImage((items) => {
		scanFile(items[0].getAsFile());
	});

	return (
		<LoadingButton
			component='label'
			loading={Boolean(progress)}
			variant='contained'
			loadingIndicator={<CircularProgress variant='determinate' value={progress * 11} />}>
			Paste or Upload File
			<Script src='https://docs.opencv.org/4.x/opencv.js' />
			<input
				hidden
				type='file'
				accept='image/*'
				onChange={({ target }) => {
					if (!target.files) return;
					scanFile(target.files[0]);
				}}
			/>
		</LoadingButton>
	);
}
