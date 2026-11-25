'use client';

import { AppBar, Tab, Tabs, Toolbar } from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigationItems = [
	{ label: 'Home', href: '/' },
	{ label: 'Characters', href: '/characters' },
	{ label: 'Talents', href: '/talents' },
	{ label: 'Artifacts', href: '/artifacts' },
	{ label: 'Weapons', href: '/weapons' },
	{ label: 'Settings', href: '/settings' },
];

export default function Header() {
	const pathname = usePathname();

	if (['/farming', '/api', '/imageMapRoute'].some((prefix) => pathname.startsWith(prefix)))
		return null;

	return (
		<AppBar position='static' elevation={0}>
			<Toolbar sx={{ justifyContent: 'center' }}>
				<Tabs
					value={
						navigationItems.find(
							({ href }) =>
								pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)),
						)?.href ?? false
					}
					variant='scrollable'
					scrollButtons='auto'
					allowScrollButtonsMobile
					sx={{
						'& .MuiTab-root': { color: 'common.white' },
						'& .MuiTab-root.Mui-selected': { color: 'common.white' },
						'& .MuiTabs-indicator': { backgroundColor: 'common.white' },
					}}>
					{navigationItems.map(({ label, href }) => (
						<Tab key={href} component={Link} href={href} value={href} label={label} />
					))}
				</Tabs>
			</Toolbar>
		</AppBar>
	);
}
