'use client';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Breadcrumbs, Button, Typography } from '@mui/joy';
import { capitalCase } from 'change-case';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEventHandler } from 'react';
import { useMemo } from 'react';
import PageLink from './link';

export type PageBackProps = {
	confirm?: boolean;
	onClick?: MouseEventHandler<HTMLButtonElement>;
	pathMap?: Record<number, boolean | string>;
	homeName?: string;
	button?: boolean;
	backButton?: boolean;
};

export default function PageBack({
	confirm: confirmBack,
	onClick,
	pathMap,
	homeName = 'Home',
	button,
	backButton,
}: PageBackProps) {
	const router = useRouter();
	const pathname = usePathname();

	const routes = useMemo(() => {
		if (pathname === '/') return [];

		let href = '';
		const paths = pathname.split('/');

		return paths.reduce<{ name: string; href: string }[]>((arr, name, index) => {
			if (paths[index]) href += `/${paths[index]}`;
			if (pathMap?.[index] !== undefined) name = pathMap[index] as string;
			if (name) arr.push({ name: capitalCase(name), href: href || '/' });
			return arr;
		}, []);
	}, [pathname]);

	const clickListener = async (e) => {
		if (confirmBack && !confirm('Are you sure you want to leave?')) throw 'cancel';

		await onClick?.(e);
		if (backButton) router.back();
	};

	if (!routes.length) return;

	if (backButton)
		return (
			<Button variant='plain' startDecorator={<ArrowBackIcon />} onClick={clickListener}>
				Back
			</Button>
		);

	if (button || backButton) {
		const lastRoute = routes[routes.length - 2] ?? { name: homeName, href: '/' };
		return (
			<Button
				variant='plain'
				startDecorator={<ArrowBackIcon />}
				component={Link}
				href={lastRoute.href}
				onClick={clickListener}>
				{lastRoute.name}
			</Button>
		);
	} else {
		return (
			<Breadcrumbs sx={{ pt: 1 }}>
				<PageLink href='/' onClick={clickListener}>
					{homeName}
				</PageLink>
				{routes.map(({ href, name }, index) => {
					if (routes.length - 1 === index) return <Typography key={index}>{name}</Typography>;
					else
						return (
							<PageLink key={index} href={href} onClick={clickListener}>
								{name}
							</PageLink>
						);
				})}
			</Breadcrumbs>
		);
	}
}
