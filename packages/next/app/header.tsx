'use client';
import { Button, ButtonGroup } from '@mui/material';
import Link from 'next/link';

export default function Header() {
	return (
		<header>
			<ButtonGroup variant='contained' color='primary'>
				<Button component={Link} href='/'>
					Home
				</Button>
				<Button component={Link} href='/characters'>
					Characters
				</Button>
				<Button component={Link} href='/talents'>
					Talents
				</Button>
				<Button component={Link} href='/artifacts'>
					Artifacts
				</Button>
				<Button component={Link} href='/weapons'>
					Weapons
				</Button>
			</ButtonGroup>
		</header>
	);
}
