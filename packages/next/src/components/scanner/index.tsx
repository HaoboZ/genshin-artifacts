import { Button, CircularProgress } from '@mui/material';
import { useNProgress } from '@tanem/react-nprogress';
import { useSnackbar } from 'notistack';
import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';
import { useDebouncedValue } from 'rooks';
import usePasteImage from '../../hooks/usePasteImage';
import { type IArtifact } from '../../types/good';
import cropBox from './cropBox';
import fileToCanvas from './fileToCanvas';
import findText from './findText';
import getRarity from './getRarity';
import isMarked from './isMarked';
import preprocessImage from './preprocessImage';
import resizeScale from './resizeScale';

export default function Scanner({
	setArtifact,
}: {
	setArtifact: Dispatch<SetStateAction<IArtifact>>;
}) {
	const { enqueueSnackbar } = useSnackbar();
	const [isLoading, setIsLoading] = useState(false);
	const [isAnimating] = useDebouncedValue(isLoading, 250);
	const { progress, isFinished } = useNProgress({ isAnimating });

	const scanFile = useCallback(async (file: File) => {
		try {
			setIsLoading(true);

			let canvas = await fileToCanvas(file);
			cropBox(preprocessImage(canvas), canvas);
			canvas = resizeScale(canvas);
			const artifact = await findText(canvas);

			setArtifact((prevArtifact) => ({
				...prevArtifact,
				...artifact,
				rarity: getRarity(canvas),
				...isMarked(canvas),
			}));
		} catch (e) {
			const error = e?.response?.data || e?.message || e;
			console.error(error);
			enqueueSnackbar(error, { variant: 'error' });
		} finally {
			setIsLoading(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	usePasteImage((items) => scanFile(items[0].getAsFile()));

	return (
		<Button
			component='label'
			loading={!isFinished}
			variant='contained'
			loadingIndicator={<CircularProgress variant='determinate' value={progress * 100} />}>
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
