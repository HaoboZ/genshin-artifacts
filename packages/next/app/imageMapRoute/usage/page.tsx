'use client';

import CodeSnippet from '@/components/codeSnippet';
import PageSection from '@/components/page/pageSection';
import PageSidebar from '@/components/page/pageSidebar';
import PageTitle from '@/components/page/pageTitle';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	Container,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';

const sideMenuItems = [
	{ id: 'ImageMapRoute', label: 'ImageMapRoute' },
	{ id: 'useRouteVideoSync', label: 'useRouteVideoSync' },
	{ id: 'useRouteYoutubeSync', label: 'useRouteYoutubeSync' },
	{ id: 'calculateCenterZoom', label: 'calculateCenterZoom' },
	{ id: 'calculateOptimalZoom', label: 'calculateOptimalZoom' },
	{ id: 'findSpotByTime', label: 'findSpotByTime' },
	{ id: 'findTimeBySpot', label: 'findTimeBySpot' },
];

const componentProps = [
	{ name: 'points', type: 'Point[]', description: 'Normalized route points (required).' },
	{ name: 'ref', type: 'RefObject<HTMLDivElement>', description: 'Forwarded container ref.' },
	{ name: 'addPoint', type: 'Dispatch<Point>', description: 'Enable adding points by clicking.' },
	{ name: 'activeSpot', type: 'Spot', description: 'Controlled active spot.' },
	{
		name: 'setActiveSpot',
		type: 'Dispatch<Spot>',
		description: 'Setter for controlled active spot.',
	},
	{
		name: 'followActiveSpot',
		type: 'boolean',
		description: 'Auto-center view on active spot.',
	},
	{
		name: 'RenderPoint',
		type: 'ComponentType<RenderPointProps>',
		description: 'Custom point renderer.',
	},
	{
		name: 'RenderPath',
		type: 'ComponentType<RenderPathProps>',
		description: 'Custom path renderer.',
	},
	{
		name: 'RenderExtra',
		type: 'ComponentType<RenderExtraProps>',
		description: 'Custom overlay renderer.',
	},
	{
		name: 'deps',
		type: 'string',
		description: 'Dependency key to reset the view.',
	},
	{
		name: 'getInitialPosition',
		type: '(containerSize) => { scale?: number; offset?: { x: number; y: number } }',
		description: 'Initial scale and offset.',
	},
	{
		name: 'getAnimatedPosition',
		type: '(containerSize) => { scale?: number; offset?: { x: number; y: number } }',
		description: 'Animated scale and offset on mount.',
	},
	{ name: 'children', type: 'ReactNode', description: 'Map image or content.' },
	{
		name: '...divProps',
		type: 'HTMLAttributes<HTMLDivElement>',
		description: 'Additional div props.',
	},
];

const hookParams = [
	{ name: 'points', type: 'Point[]', description: 'Route points used to sync time.' },
];

const hookReturns = [
	{ name: 'routeRef', type: 'RefObject<HTMLDivElement>', description: 'Attach to ImageMapRoute.' },
	{ name: 'videoRef', type: 'RefObject<HTMLVideoElement>', description: 'Attach to video.' },
	{ name: 'time', type: 'number', description: 'Current playback time.' },
	{ name: 'setTime', type: '(time: number) => void', description: 'Seek to a time.' },
	{ name: 'activeSpot', type: 'Spot', description: 'Current active spot.' },
	{ name: 'setActiveSpot', type: '(spot: Spot) => void', description: 'Set active spot.' },
];

const youtubeHookReturns = [
	{ name: 'routeRef', type: 'RefObject<HTMLDivElement>', description: 'Attach to ImageMapRoute.' },
	{
		name: 'playerRef',
		type: 'RefObject<YoutubePlayer>',
		description: 'Assign the YouTube player instance on ready.',
	},
	{ name: 'time', type: 'number', description: 'Current playback time.' },
	{ name: 'setTime', type: '(time: number) => void', description: 'Seek to a time.' },
	{ name: 'activeSpot', type: 'Spot', description: 'Current active spot.' },
	{ name: 'setActiveSpot', type: '(spot: Spot) => void', description: 'Set active spot.' },
	{
		name: 'onPlayerReady',
		type: '(event) => void',
		description: 'Assigns the player from the IFrame API ready event.',
	},
	{
		name: 'onPlayerStateChange',
		type: '(event) => void',
		description: 'Tracks play/pause state from the IFrame API.',
	},
];

const utilParams = {
	calculateCenterZoom: [
		{ name: 'point', type: 'Point', description: 'Normalized point to center.' },
		{ name: 'containerSize', type: 'DOMRect', description: 'Container size.' },
		{ name: 'scale', type: 'number', description: 'Current scale.' },
	],
	calculateOptimalZoom: [
		{ name: 'points', type: 'Point[]', description: 'Route points.' },
		{ name: 'containerSize', type: 'DOMRect', description: 'Container size.' },
		{ name: 'zoom', type: 'number', description: 'Target fill ratio.' },
		{
			name: 'maxScale',
			type: 'number (optional)',
			description: 'Upper bound for scale.',
		},
	],
	findSpotByTime: [
		{ name: 'points', type: 'Point[]', description: 'Route points.' },
		{ name: 'time', type: 'number', description: 'Playback time.' },
	],
	findTimeBySpot: [
		{ name: 'points', type: 'Point[]', description: 'Route points.' },
		{ name: 'spot', type: 'Spot', description: 'Selected spot.' },
	],
};

const utilReturns = {
	calculateCenterZoom: [
		{
			name: 'return',
			type: '{ scale: number; offset: { x: number; y: number } }',
			description: 'Centered scale and offset.',
		},
	],
	calculateOptimalZoom: [
		{
			name: 'return',
			type: '{ scale: number; offset: { x: number; y: number } }',
			description: 'Fit scale and offset.',
		},
	],
	findSpotByTime: [
		{
			name: 'return',
			type: 'Spot | null',
			description: 'Interpolated spot for the time.',
		},
	],
	findTimeBySpot: [
		{
			name: 'return',
			type: 'number | null',
			description: 'Playback time for the spot.',
		},
	],
};

const componentImportSnippet = `import { ImageMapRoute } from 'image-map-route';`;
const hookImportSnippet = `import { useRouteVideoSync } from 'image-map-route';`;
const hookYoutubeImportSnippet = `import { useRouteYoutubeSync } from 'image-map-route';`;
const hookYoutubeExampleSnippet = `const { onPlayerReady, onPlayerStateChange } = useRouteYoutubeSync(points);

useEffect(() => {
	const createPlayer = () => {
		new window.YT.Player('yt-player', {
			height: '360',
			width: '640',
			videoId,
			events: { onReady: onPlayerReady, onStateChange: onPlayerStateChange },
		});
	};

	if (window.YT?.Player) return createPlayer();

	const tag = document.createElement('script');
	tag.src = 'https://www.youtube.com/iframe_api';
	document.body.appendChild(tag);
	window.onYouTubeIframeAPIReady = createPlayer;
}, [videoId, onPlayerReady, onPlayerStateChange]);
`;
const utilsImportSnippet = `import {
	calculateCenterZoom,
	calculateOptimalZoom,
	findSpotByTime,
	findTimeBySpot,
} from 'image-map-route';`;

function ParamTable({
	rows,
}: {
	rows: Array<{ name: string; type: string; description: string }>;
}) {
	return (
		<TableContainer component={Paper} variant='outlined'>
			<Table size='small'>
				<TableHead>
					<TableRow>
						<TableCell sx={{ width: 200 }}>Name</TableCell>
						<TableCell sx={{ width: 260 }}>Type</TableCell>
						<TableCell>Description</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<TableRow key={row.name}>
							<TableCell>
								<Typography component='span' fontWeight={600}>
									{row.name}
								</Typography>
							</TableCell>
							<TableCell>
								<Typography component='span' sx={{ fontFamily: 'monospace' }}>
									{row.type}
								</Typography>
							</TableCell>
							<TableCell>{row.description}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default function ImageMapRouteUsage() {
	return (
		<Container>
			<PageTitle>API Usage</PageTitle>
			<PageSection>
				<PageSidebar sideMenuItems={sideMenuItems}>
					<Box>
						<Typography variant='h5'>Overview</Typography>
						<Typography color='text.secondary' sx={{ mt: 1 }}>
							Use the component for routing overlays, the hook for video sync, and the utils
							for zoom and time mapping. The examples below follow a single route model with
							normalized point coordinates (0-1).
						</Typography>
					</Box>
					<Accordion id='ImageMapRoute' sx={{ scrollMarginTop: 80, mt: 1 }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant='h6'>ImageMapRoute</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography color='text.secondary'>Props for the main component.</Typography>
							<CodeSnippet>{componentImportSnippet}</CodeSnippet>
							<ParamTable rows={componentProps} />
						</AccordionDetails>
					</Accordion>
					<Accordion id='useRouteVideoSync' sx={{ scrollMarginTop: 80 }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant='h6'>useRouteVideoSync</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography color='text.secondary'>
								Hook inputs for syncing a route with a video timeline.
							</Typography>
							<CodeSnippet>{hookImportSnippet}</CodeSnippet>
							<ParamTable rows={hookParams} />
							<Typography variant='subtitle2'>Returns</Typography>
							<ParamTable rows={hookReturns} />
						</AccordionDetails>
					</Accordion>
					<Accordion id='useRouteYoutubeSync' sx={{ scrollMarginTop: 80, mb: 1 }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant='h6'>useRouteYoutubeSync</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography color='text.secondary'>
								Hook inputs for syncing a route with a YouTube player instance.
							</Typography>
							<CodeSnippet>{hookYoutubeImportSnippet}</CodeSnippet>
							<ParamTable rows={hookParams} />
							<Typography variant='subtitle2'>Returns</Typography>
							<ParamTable rows={youtubeHookReturns} />
							<Typography variant='subtitle2'>Example</Typography>
							<CodeSnippet>{hookYoutubeExampleSnippet}</CodeSnippet>
						</AccordionDetails>
					</Accordion>
					<Box>
						<Typography variant='h5'>Utils</Typography>
						<Typography color='text.secondary' sx={{ mt: 1 }}>
							Each utility is independent and can be used to calculate zoom or map time
							positioning.
						</Typography>
						<CodeSnippet>{utilsImportSnippet}</CodeSnippet>
					</Box>
					<Accordion id='calculateCenterZoom' sx={{ scrollMarginTop: 80 }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant='h6'>calculateCenterZoom</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography color='text.secondary'>
								Center the view on a single point using the current zoom scale.
							</Typography>
							<ParamTable rows={utilParams.calculateCenterZoom} />
							<Typography variant='subtitle2'>Returns</Typography>
							<ParamTable rows={utilReturns.calculateCenterZoom} />
						</AccordionDetails>
					</Accordion>
					<Accordion id='calculateOptimalZoom' sx={{ scrollMarginTop: 80 }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant='h6'>calculateOptimalZoom</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography color='text.secondary'>
								Fit a route inside the container while respecting a max scale.
							</Typography>
							<ParamTable rows={utilParams.calculateOptimalZoom} />
							<Typography variant='subtitle2'>Returns</Typography>
							<ParamTable rows={utilReturns.calculateOptimalZoom} />
						</AccordionDetails>
					</Accordion>
					<Accordion id='findSpotByTime' sx={{ scrollMarginTop: 80 }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant='h6'>findSpotByTime</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography color='text.secondary'>
								Resolve the interpolated route spot at a given timestamp.
							</Typography>
							<ParamTable rows={utilParams.findSpotByTime} />
							<Typography variant='subtitle2'>Returns</Typography>
							<ParamTable rows={utilReturns.findSpotByTime} />
						</AccordionDetails>
					</Accordion>
					<Accordion id='findTimeBySpot' sx={{ scrollMarginTop: 80 }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant='h6'>findTimeBySpot</Typography>
						</AccordionSummary>
						<AccordionDetails>
							<Typography color='text.secondary'>
								Map a spot selection back to the playback time.
							</Typography>
							<ParamTable rows={utilParams.findTimeBySpot} />
							<Typography variant='subtitle2'>Returns</Typography>
							<ParamTable rows={utilReturns.findTimeBySpot} />
						</AccordionDetails>
					</Accordion>
				</PageSidebar>
			</PageSection>
		</Container>
	);
}
