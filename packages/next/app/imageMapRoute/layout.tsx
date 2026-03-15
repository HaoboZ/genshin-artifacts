'use client';

import { AppBar, Button, Divider, Stack, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';

const githubUrl = 'https://github.com/HaoboZ/genshin-artifacts/tree/main/packages/image-map-route';
const npmUrl = 'https://www.npmjs.com/package/image-map-route';

export default function ImageMapRouteLayout({ children }: { children: ReactNode }) {
	return (
		<Fragment>
			<AppBar position='sticky'>
				<Toolbar>
					<Stack direction='row' spacing={2} sx={{ alignItems: 'center', flexGrow: 1 }}>
						<Typography variant='h6'>image-map-route</Typography>
						<Divider orientation='vertical' flexItem />
						<Stack direction='row' spacing={1}>
							<Button component={Link} href='/imageMapRoute' variant='text'>
								Home
							</Button>
							<Button component={Link} href='/imageMapRoute/usage' variant='text'>
								API Usage
							</Button>
							<Button component={Link} href='/imageMapRoute/examples' variant='text'>
								Examples
							</Button>
							<Button component={Link} href='/imageMapRoute/editor' variant='text'>
								Editor
							</Button>
						</Stack>
					</Stack>
					<Stack direction='row' spacing={1}>
						<Button component={Link} href={githubUrl} target='_blank' rel='noreferrer'>
							GitHub
						</Button>
						<Button component={Link} href={npmUrl} target='_blank' rel='noreferrer'>
							npm
						</Button>
					</Stack>
				</Toolbar>
			</AppBar>
			{children}
		</Fragment>
	);
}
