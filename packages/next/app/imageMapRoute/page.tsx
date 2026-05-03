'use client';

import CodeSnippet from '@/components/codeSnippet';
import PageSection from '@/components/page/pageSection';
import PageSidebar from '@/components/page/pageSidebar';
import PageTitle from '@/components/page/pageTitle';
import { Box, Container, Stack, Typography } from '@mui/material';
import { ImageMapRoute } from 'image-map-route';

const installSnippet = `npm i image-map-route
# or
pnpm add image-map-route
# or
yarn add image-map-route`;

const features = [
	'TypeScript-first API.',
	'Full customization freedom with rendering.',
	'Interactions: hover, click, drag, and zoom built-in.',
	'Normalized coordinates with responsive scaling.',
	'Video-sync hook for timeline-driven routes.',
	'Utility helpers for zooming and handling of points.',
];

const exampleSnippet = `import { ImageMapRoute } from 'image-map-route';

const points = [
	{ x: 0.08, y: 0.5 },
	{ x: 0.18, y: 0.42 },
	{ x: 0.28, y: 0.58 },
	{ x: 0.38, y: 0.44 },
	{ x: 0.48, y: 0.6 },
	{ x: 0.58, y: 0.46 },
	{ x: 0.68, y: 0.62 },
	{ x: 0.78, y: 0.48 },
	{ x: 0.88, y: 0.56 },
];

export default function Demo() {
	return (
		<ImageMapRoute points={points}>
			<img
				src='https://upload.wikimedia.org/wikipedia/commons/c/c5/AmFBfield.svg'
				alt='Field'
				style={{ width: '100%' }}
			/>
		</ImageMapRoute>
	);
}`;

const sideMenuItems = [
	{ id: 'installation', label: 'Installation' },
	{ id: 'features', label: 'Features' },
	{ id: 'example', label: 'Basic Example' },
];

export default function ImageMapRouteHome() {
	return (
		<Container>
			<PageTitle>Image Map Route</PageTitle>
			<PageSection>
				<PageSidebar sideMenuItems={sideMenuItems}>
					<Typography id='installation' variant='h5' sx={{ scrollMarginTop: 80 }}>
						Installation
					</Typography>
					<CodeSnippet>{installSnippet}</CodeSnippet>
					<Typography id='features' variant='h5' sx={{ scrollMarginTop: 80 }}>
						Features
					</Typography>
					<Stack component='ul' spacing={1}>
						{features.map((item) => (
							<Box component='li' key={item}>
								<Typography>{item}</Typography>
							</Box>
						))}
					</Stack>
					<Typography id='example' variant='h5' sx={{ scrollMarginTop: 80 }}>
						Basic Example
					</Typography>
					<CodeSnippet>{exampleSnippet}</CodeSnippet>
					<Box sx={{ mt: 2 }}>
						<ImageMapRoute
							points={[
								{ x: 0.08, y: 0.5 },
								{ x: 0.18, y: 0.42 },
								{ x: 0.28, y: 0.58 },
								{ x: 0.38, y: 0.44 },
								{ x: 0.48, y: 0.6 },
								{ x: 0.58, y: 0.46 },
								{ x: 0.68, y: 0.62 },
								{ x: 0.78, y: 0.48 },
								{ x: 0.88, y: 0.56 },
							]}>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img
								src='https://upload.wikimedia.org/wikipedia/commons/9/94/Football_field_diagram.webp'
								alt='Field'
								style={{ width: '100%' }}
							/>
						</ImageMapRoute>
					</Box>
				</PageSidebar>
			</PageSection>
		</Container>
	);
}
