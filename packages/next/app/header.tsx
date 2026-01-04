'use client';
import { Button, ButtonGroup } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
	const pathname = usePathname();

	if (pathname.startsWith('/farming') || pathname.startsWith('/api')) return null;

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
				<Button component={Link} href='/settings'>
					Settings
				</Button>
			</ButtonGroup>
		</header>
	);
}
