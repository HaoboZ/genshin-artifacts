'use client';

import PageSection from '@/components/page/pageSection';
import PageTitle from '@/components/page/pageTitle';
import { Button, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import Link from 'next/link';

const examples = [
	{
		id: 'genshin',
		title: 'Genshin Impact Artifact Routes',
		link: '/farming',
	},
	// {
	// 	id: 'pacman',
	// 	title: 'Pacman',
	// 	description: 'Grid-based paths with per-tile nodes, ideal for route previews.',
	// 	tags: ['tile map', 'classic'],
	// },
	// {
	// 	id: 'rocket-league',
	// 	title: 'Rocket League',
	// 	description: 'Arena overlays with boost paths and timing sync.',
	// 	tags: ['arena', 'timed'],
	// },
	// {
	// 	id: 'fortnite',
	// 	title: 'Fortnite',
	// 	description: 'Large map routing with named locations and route weights.',
	// 	tags: ['battle royale', 'large map'],
	// },
];

export default function ImageMapRouteExamples() {
	return (
		<Container>
			<PageTitle>Examples</PageTitle>
			<PageSection>
				<Grid container spacing={2}>
					{examples.map((example) => (
						<Grid
							key={example.id}
							size={4}
							component={Paper}
							variant='outlined'
							sx={{ p: 2, height: '100%' }}>
							<Stack spacing={1}>
								<Typography variant='h6'>{example.title}</Typography>
								<Button variant='contained' component={Link} href={example.link}>
									Open Demo
								</Button>
							</Stack>
						</Grid>
					))}
				</Grid>
			</PageSection>
		</Container>
	);
}
