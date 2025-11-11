'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useClipboardImage from '@/src/hooks/useClipboardImage';
import { IArtifact } from '@/src/types/good';
import { Button, CircularProgress, Grid } from '@mui/material';
import Script from 'next/script';
import { useSnackbar } from 'notistack';
import { useCallback, useRef, useState } from 'react';
import crop from '../artifacts/artifactForm/scanner/crop';
import lock from '../artifacts/artifactForm/scanner/lock';
import match from '../artifacts/artifactForm/scanner/match';
import rarity from '../artifacts/artifactForm/scanner/rarity';
import text from '../artifacts/artifactForm/scanner/text';

export default function ScanTest() {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const { enqueueSnackbar } = useSnackbar();
	const [progress, setProgress] = useState(0);

	const [artifact, setArtifact] = useState<IArtifact>();

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
					if ((await match(newCanvas)) > 30000) throw Error('No matches');

					canvasRef.current.width = newCanvas.width;
					canvasRef.current.height = newCanvas.height;
					const ctx = canvasRef.current.getContext('2d');
					ctx.drawImage(newCanvas, 0, 0);

					const artifact = await text(canvasRef.current, setProgress);

					setArtifact({
						...artifact,
						rarity: rarity(newCanvas),
						lock: lock(newCanvas),
					});
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

	useClipboardImage((items) => scanFile(items[0].getAsFile()));

	return (
		<PageContainer>
			<PageTitle>Scan Test</PageTitle>
			<Script src='https://docs.opencv.org/4.x/opencv.js' />
			<PageSection>
				<Grid container spacing={1}>
					<Grid size={8}>
						<Button
							component='label'
							loading={Boolean(progress)}
							variant='contained'
							loadingIndicator={
								<CircularProgress variant='determinate' value={progress * 11} />
							}>
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
						<pre>{JSON.stringify(artifact, null, 2)}</pre>
					</Grid>
					<Grid size={4}>
						<canvas
							ref={canvasRef}
							style={{
								width: 'auto',
								height: 'auto',
								maxWidth: '100%',
								maxHeight: '100%',
							}}
						/>
					</Grid>
				</Grid>
			</PageSection>
		</PageContainer>
	);
}
