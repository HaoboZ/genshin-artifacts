'use client';

import PageSection from '@/components/page/pageSection';
import PageTitle from '@/components/page/pageTitle';
import fileToCanvas from '@/components/scanner/fileToCanvas';
import { extractArtifact } from '@/components/scanner/artifactScan';
import matchPixels from '@/components/scanner/matchPixels';
import { type IArtifact } from '@/types/good';
import { Box, Button, Container, Stack } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

export default function InternalScan() {
	const containerRef = useRef<HTMLDivElement>(null);
	const savedCanvasRef = useRef<HTMLCanvasElement>(null);

	const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([]);
	const [currentIndex, setCurrentIndex] = useState(-1);
	const [hasSavedCanvas, setHasSavedCanvas] = useState(false);
	const [artifact, setArtifact] = useState<Partial<IArtifact>>({});

	useEffect(() => {
		setCurrentIndex(canvases.length - 1);
	}, [canvases]);

	useEffect(() => {
		if (currentIndex < 0 || !canvases[currentIndex]) return;
		containerRef.current.innerHTML = '';
		containerRef.current.appendChild(canvases[currentIndex]);
	}, [currentIndex, canvases]);

	function addCanvas(newCanvas: HTMLCanvasElement) {
		Object.assign(newCanvas.style, { height: '500px' });
		setCanvases((prev) => [...prev.slice(0, currentIndex + 1), newCanvas]);
		setCurrentIndex(currentIndex + 1);
	}

	return (
		<Container>
			<PageTitle>Scan Test</PageTitle>
			<PageSection>
				<Stack spacing={1}>
					<Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
						<Button component='label' variant='contained'>
							Upload
							<input
								hidden
								type='file'
								accept='image/*'
								onChange={async (e) => {
									if (!e.target.files) return;
									const canvas = document.createElement('canvas');
									await fileToCanvas(e.target.files[0], canvas);
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
							disabled={currentIndex < 0}
							onClick={() => {
								const canvas = canvases[currentIndex];
								const ctx = savedCanvasRef.current.getContext('2d');
								savedCanvasRef.current.width = canvas.width;
								savedCanvasRef.current.height = canvas.height;
								ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height);
								setHasSavedCanvas(true);
							}}>
							Save
						</Button>
						<Button
							variant='contained'
							disabled={currentIndex < 0 || !hasSavedCanvas}
							onClick={async () => {
								console.info(
									await matchPixels(canvases[currentIndex], savedCanvasRef.current),
								);
							}}>
							Compare
						</Button>
					</Stack>
					<Stack direction='row' spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
						<Button
							variant='contained'
							onClick={async () => {
								const time = performance.now();
								const artifact = await extractArtifact(canvases[currentIndex]);
								console.info('time:', performance.now() - time, 'ms');
								setArtifact(artifact);
							}}>
							Text
						</Button>
					</Stack>
					<Stack direction='row' spacing={1}>
						<Box ref={containerRef} />
						<pre>{JSON.stringify(artifact, null, '\t')}</pre>
					</Stack>
					<Box>
						<canvas ref={savedCanvasRef} style={{ height: 500 }} />
					</Box>
				</Stack>
			</PageSection>
		</Container>
	);
}
