'use client';
import PageSection from '@/components/page/pageSection';
import PageTitle from '@/components/page/pageTitle';
import cropBox from '@/components/scanner/cropBox';
import fileToCanvas from '@/components/scanner/fileToCanvas';
import findText from '@/components/scanner/findText';
import getRarity from '@/components/scanner/getRarity';
import isMarked from '@/components/scanner/isMarked';
import matchPixels from '@/components/scanner/matchPixels';
import preprocessImage from '@/components/scanner/preprocessImage';
import resizeScale from '@/components/scanner/resizeScale';
import { type IArtifact } from '@/types/good';
import { Box, Button, Container, Stack } from '@mui/material';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export default function InternalScan() {
	const containerRef = useRef<HTMLDivElement>(null);
	const savedCanvasRef = useRef<HTMLCanvasElement>(null);

	const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [artifact, setArtifact] = useState<Partial<IArtifact>>({});

	useEffect(() => {
		setCurrentIndex(canvases.length - 1);
	}, [canvases]);

	useEffect(() => {
		if (containerRef.current && currentIndex >= 0 && canvases[currentIndex]) {
			containerRef.current.innerHTML = '';
			containerRef.current.appendChild(canvases[currentIndex]);
		}
	}, [currentIndex, canvases]);

	function addCanvas(newCanvas: HTMLCanvasElement) {
		Object.assign(newCanvas.style, { height: '500px' });
		setCanvases((prev) => [...prev.slice(0, currentIndex + 1), newCanvas]);
		setCurrentIndex(currentIndex + 1);
	}

	return (
		<Container>
			<PageTitle>Scan Test</PageTitle>
			<Script src='https://docs.opencv.org/4.x/opencv.js' />
			<PageSection>
				<Stack spacing={1}>
					<Stack spacing={1} direction='row' useFlexGap sx={{ flexWrap: 'wrap' }}>
						<Button component='label' variant='contained'>
							Upload
							<input
								hidden
								type='file'
								accept='image/*'
								onChange={async ({ target }) => {
									if (!target.files) return;
									const canvas = document.createElement('canvas');
									await fileToCanvas(target.files[0], canvas);
									Object.assign(canvas.style, { height: '500px' });
									setCanvases([canvas]);
								}}
							/>
						</Button>
						<Button
							variant='contained'
							disabled={currentIndex <= 0}
							onClick={() => setCurrentIndex((index) => index - 1)}>
							Back
						</Button>
						<Button
							variant='contained'
							disabled={currentIndex >= canvases.length - 1}
							onClick={() => setCurrentIndex((index) => index + 1)}>
							Forward
						</Button>
						<Button
							variant='contained'
							onClick={() => {
								const canvas = canvases[currentIndex];
								const ctx = savedCanvasRef.current.getContext('2d');
								savedCanvasRef.current.width = canvas.width;
								savedCanvasRef.current.height = canvas.height;
								ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
							}}>
							Save
						</Button>
						<Button
							variant='contained'
							disabled={!savedCanvasRef}
							onClick={async () => {
								console.log(
									await matchPixels(canvases[currentIndex], savedCanvasRef.current),
								);
							}}>
							Compare
						</Button>
					</Stack>
					<Stack spacing={1} direction='row' useFlexGap sx={{ flexWrap: 'wrap' }}>
						<Button
							variant='contained'
							onClick={() => {
								const time = performance.now();
								const [image, processed] = preprocessImage(canvases[currentIndex]);
								console.log('time:', performance.now() - time, 'ms');
								const canvas = document.createElement('canvas');
								cv.imshow(canvas, processed);
								image.delete();
								processed.delete();
								addCanvas(canvas);
							}}>
							Process
						</Button>
						<Button
							variant='contained'
							onClick={() => {
								const canvas = document.createElement('canvas');
								const time = performance.now();
								cropBox(preprocessImage(canvases[currentIndex]), canvas);
								console.log('time:', performance.now() - time, 'ms');
								addCanvas(canvas);
							}}>
							Process & Crop
						</Button>
						<Button
							variant='contained'
							onClick={() => addCanvas(resizeScale(canvases[currentIndex]))}>
							Resize
						</Button>
						<Button
							variant='contained'
							onClick={async () => {
								const canvas = document.createElement('canvas');
								const time = performance.now();
								const artifact = await findText(canvases[currentIndex], canvas);
								console.log('time:', performance.now() - time, 'ms');
								setArtifact(artifact);
								addCanvas(canvas);
							}}>
							Text
						</Button>
						<Button
							variant='contained'
							onClick={() => {
								const canvas = document.createElement('canvas');
								setArtifact((artifact) => ({
									...artifact,
									...isMarked(canvases[currentIndex], canvas),
								}));
								addCanvas(canvas);
							}}>
							Marked
						</Button>
						<Button
							variant='contained'
							onClick={() => {
								const canvas = document.createElement('canvas');
								setArtifact((artifact) => ({
									...artifact,
									rarity: getRarity(canvases[currentIndex], canvas),
								}));
								addCanvas(canvas);
							}}>
							Rarity
						</Button>
					</Stack>
					<Stack spacing={1} direction='row'>
						<Box ref={containerRef} />
						<pre>{JSON.stringify(artifact, null, 2)}</pre>
					</Stack>
					<Box>
						<canvas ref={savedCanvasRef} style={{ height: 500 }} />
					</Box>
				</Stack>
			</PageSection>
		</Container>
	);
}
