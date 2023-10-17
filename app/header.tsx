'use client';
import { PageLinkComponent } from '@/components/page/link';
import { Button, ButtonGroup } from '@mui/material';

export default function Header() {
	return (
		<header>
			<ButtonGroup>
				<Button component={PageLinkComponent} href='/' variant='contained'>
					Home
				</Button>
				<Button component={PageLinkComponent} href='/characters' variant='contained'>
					Characters
				</Button>
				<Button component={PageLinkComponent} href='/artifacts' variant='contained'>
					Artifacts
				</Button>
				<Button component={PageLinkComponent} href='/weapons' variant='contained'>
					Weapons
				</Button>
			</ButtonGroup>
		</header>
	);
}
