'use client';
import { PageLinkComponent } from '@/components/page/link';
import { Button, ButtonGroup } from '@mui/material';

export default function Header() {
	return (
		<header>
			<ButtonGroup variant='contained'>
				<Button component={PageLinkComponent} href='/'>
					Home
				</Button>
				<Button component={PageLinkComponent} href='/characters'>
					Characters
				</Button>
				<Button component={PageLinkComponent} href='/artifacts'>
					Artifacts
				</Button>
				<Button component={PageLinkComponent} href='/weapons'>
					Weapons
				</Button>
			</ButtonGroup>
		</header>
	);
}
