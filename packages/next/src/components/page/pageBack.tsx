import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import { capitalCase } from 'change-case';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type MouseEventHandler, useMemo } from 'react';

export type PageBackProps = {
	confirm?: boolean;
	onClickAction?: MouseEventHandler<HTMLElement>;
	pathMap?: Record<number, boolean | string>;
	homeName?: string;
	backButton?: boolean;
};

export default function PageBack({
	confirm: confirmBack,
	onClickAction,
	pathMap,
	homeName = 'Home',
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
	}, [pathMap, pathname]);

	const clickListener: MouseEventHandler<HTMLElement> = async (e) => {
		if (confirmBack && !confirm('Are you sure you want to leave?')) return;

		await onClickAction?.(e);
		if (backButton) router.back();
	};

	if (!routes.length) return;

	if (backButton) {
		return (
			<Button variant='text' startIcon={<ArrowBackIcon />} onClick={clickListener}>
				Back
			</Button>
		);
	}

	const lastRoute = routes[routes.length - 2] ?? { name: homeName, href: '/' };
	return (
		<Button
			variant='text'
			startIcon={<ArrowBackIcon />}
			component={Link}
			href={lastRoute.href}
			onClick={clickListener}>
			{lastRoute.name}
		</Button>
	);
}
