import useClipboardImage from '@/src/hooks/useClipboardImage';
import type { IArtifact } from '@/src/types/good';
import { Button, CircularProgress } from '@mui/material';
import { useSnackbar } from 'notistack';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useState } from 'react';
import crop from './crop';
import lock from './lock';
import match from './match';
import rarity from './rarity';
import text from './text';

export default function Scanner({
	setArtifact,
}: {
	setArtifact: Dispatch<SetStateAction<IArtifact>>;
}) {
	const { enqueueSnackbar } = useSnackbar();
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
					const newCanvas = await crop(canvas);
					if ((await match(newCanvas)) > 30000) throw 'No matches';

					const artifact = await text(newCanvas, setProgress);
					setArtifact((prevArtifact) => ({
						...prevArtifact,
						...artifact,
						rarity: rarity(newCanvas),
						lock: lock(newCanvas),
					}));
				} catch (e) {
					const error = e?.response?.data || e?.message || e;
					if (typeof error === 'string') {
						enqueueSnackbar(error, { variant: 'error' });
					} else {
						console.error(error);
						enqueueSnackbar('An unknown error has occurred', { variant: 'error' });
					}
				}
				setProgress(0);
			};
			img.src = target.result as string;
		};
		reader.readAsDataURL(file);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useClipboardImage((items) => {
		scanFile(items[0].getAsFile());
	});

	return (
		<Button
			component='label'
			loading={Boolean(progress)}
			variant='contained'
			loadingIndicator={<CircularProgress variant='determinate' value={progress * 11} />}>
			Paste or Upload File
			<input
				hidden
				type='file'
				accept='image/*'
				onChange={({ target }) => {
					if (!target.files) return;
					scanFile(target.files[0]);
				}}
			/>
		</Button>
	);
}
