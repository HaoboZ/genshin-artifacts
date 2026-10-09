import { Button, CircularProgress } from '@mui/material';
import { useNProgress } from '@tanem/react-nprogress';
import { useSnackbar } from 'notistack';
import { type Dispatch, type SetStateAction, useCallback, useState } from 'react';
import { useDebouncedValue } from 'rooks';
import usePasteImage from '../../hooks/usePasteImage';
import { type IArtifact } from '@/types/good';
import { extractArtifact } from './artifactScan';

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

			const artifact = await extractArtifact(file);

			setArtifact((prevArtifact) => ({
				...prevArtifact,
				...artifact,
				substats: [
					...artifact.substats,
					...(artifact.unactivatedSubstats ?? []).map((substat) => ({
						...substat,
						unactivated: true,
					})),
				],
				unactivatedSubstats: undefined,
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
			fullWidth
			component='label'
			loading={!isFinished}
			variant='contained'
			loadingIndicator={<CircularProgress variant='determinate' value={progress * 100} />}>
			Paste or Upload File
			<input
				hidden
				type='file'
				accept='image/*'
				onChange={(e) => {
					if (!e.target.files) return;
					scanFile(e.target.files[0]);
				}}
			/>
		</Button>
	);
}
