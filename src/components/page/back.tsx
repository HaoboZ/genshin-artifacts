import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Breadcrumbs, Button, Typography } from '@mui/material';
import { startCase } from 'lodash';
import { usePathname, useRouter } from 'next/navigation';
import type { MouseEventHandler } from 'react';
import { useMemo } from 'react';
import useWideMedia from '../../hooks/useWideMedia';
import PageLink, { PageLinkComponent } from './link';

export type PageBackProps = {
	confirm?: boolean;
	onClick?: MouseEventHandler<HTMLButtonElement>;
	pathMap?: Record<number, boolean | string>;
	backButton?: boolean;
};

export default function PageBack({
	confirm: confirmBack,
	onClick,
	pathMap,
	backButton,
}: PageBackProps) {
	const router = useRouter();
	const pathname = usePathname();
	const wide = useWideMedia();

	const routes = useMemo(() => {
		if (pathname === '/') return [];

		let href = '';
		const paths = pathname.split('/');

		return paths.reduce<{ name: string; href: string }[]>((arr, name, index) => {
			if (paths[index]) href += `/${paths[index]}`;
			if (pathMap?.[index] !== undefined) name = pathMap[index] as string;
			if (name) arr.push({ name: startCase(name), href: href || '/' });
			return arr;
		}, []);
	}, [pathname]);

	const clickListener = async (e) => {
		if (confirmBack && !confirm('Are you sure you want to leave?')) throw 'cancel';

		await onClick?.(e);
		if (backButton) router.back();
	};

	if (!backButton && wide) {
		return (
			<Breadcrumbs sx={{ pt: 1 }}>
				<div />
				{routes.map(({ href, name }, index) => {
					if (routes.length - 1 === index) {
						return <Typography key={index}>{name}</Typography>;
					} else {
						return (
							<PageLink
								key={index}
								underline='none'
								color='primary'
								href={href}
								onClick={clickListener}>
								{name}
							</PageLink>
						);
					}
				})}
			</Breadcrumbs>
		);
	} else {
		const path = routes.at(-2);
		if (!path) return null;

		return (
			<Button
				component={backButton ? undefined : PageLinkComponent}
				href={backButton ? undefined : path.href}
				startIcon={<ArrowBackIcon />}
				onClick={clickListener}>
				{backButton ? 'Back' : path.name}
			</Button>
		);
	}
}
