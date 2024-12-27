import { useModalControls } from '@/src/providers/modal';
import DialogWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import { Box, Button, DialogActions, DialogContent, DialogTitle, Grid2 } from '@mui/material';
import { nanoid } from 'nanoid';
import Script from 'next/script';
import hash from 'object-hash';
import { useRef, useState } from 'react';
import ArtifactStatImage from '../artifactStatImage';
import crop from './scanner/crop';
import match from './scanner/match';
import rarity from './scanner/rarity';
import text from './scanner/text';

export default function BatchAddArtifactModal() {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const canvasRef = useRef<HTMLCanvasElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	const [capturing, setCapturing] = useState(false);
	const [artifacts, setArtifacts] = useState<Record<string, IArtifact>>({});

	return (
		<DialogWrapper>
			<Script src='https://docs.opencv.org/4.x/opencv.js' />
			<DialogTitle>Add Artifacts</DialogTitle>
			<DialogContent>
				<Grid2 container spacing={1}>
					<Grid2 size={4}>
						<Box
							sx={{
								border: '1px solid',
								width: '100%',
								aspectRatio: '10/17',
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								cursor: 'pointer',
							}}
							onClick={async () => {
								if (capturing) {
									(videoRef.current.srcObject as MediaStream)
										.getTracks()
										.forEach((track) => track.stop());
									return;
								}
								try {
									videoRef.current = document.createElement('video');
									videoRef.current.srcObject =
										await navigator.mediaDevices.getDisplayMedia();

									let detecting = false;
									let prevCanvas;
									const interval = setInterval(async () => {
										if (detecting) return;
										const canvas = document.createElement('canvas');
										const ctx = canvas.getContext('2d', { willReadFrequently: true });

										canvas.width = videoRef.current.videoWidth;
										canvas.height = videoRef.current.videoHeight;
										ctx.drawImage(videoRef.current, 0, 0);
										detecting = true;
										try {
											const newCanvas = await crop(canvas);
											const misMatch = await match(canvas);
											if (misMatch > 30000) throw 'No matches';
											if (prevCanvas) {
												const misMatch = await match(canvas, prevCanvas);
												if (misMatch < 1000) throw 'Identical detected';
											}
											canvasRef.current.width = newCanvas.width;
											canvasRef.current.height = newCanvas.height;
											const ctx = canvasRef.current.getContext('2d');
											ctx.drawImage(newCanvas, 0, 0);

											const artifact = await text(canvasRef.current);
											artifact.id = nanoid();
											artifact.rarity = rarity(canvas);
											// TODO: implement these 2
											artifact.location = '';
											artifact.lock = false;
											prevCanvas = canvas;
											setArtifacts((artifacts) => ({
												...artifacts,
												[hash(artifact, { excludeKeys: (key) => key === 'id' })]:
													artifact,
											}));
										} catch (e) {
											console.error(e);
										}
										detecting = false;
									}, 1000);
									videoRef.current.addEventListener('suspend', () => {
										clearInterval(interval);
										setCapturing(false);
									});
									setCapturing(true);
									await videoRef.current.play();
								} catch (err) {
									console.error('Error: ' + err);
								}
							}}>
							{capturing ? (
								<canvas
									ref={canvasRef}
									style={{
										width: 'auto',
										height: 'auto',
										maxWidth: '100%',
										maxHeight: '100%',
									}}
								/>
							) : (
								'Click to Capture'
							)}
						</Box>
					</Grid2>
					<Grid2 size={8}>
						<Grid2 container spacing={1} sx={{ overflowY: 'auto' }}>
							{Object.entries(artifacts)
								.toReversed()
								.map(([key, artifact]) => (
									<Grid2 key={key} size={6}>
										<ArtifactStatImage artifact={artifact} />
									</Grid2>
								))}
						</Grid2>
					</Grid2>
				</Grid2>
			</DialogContent>
			<DialogActions>
				<Button
					variant='contained'
					onClick={() => {
						dispatch(goodActions.addArtifacts(Object.values(artifacts)));
						closeModal();
					}}>
					Save
				</Button>
			</DialogActions>
		</DialogWrapper>
	);
}
