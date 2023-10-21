import type { LinkProps } from '@mui/joy';
import { Link } from '@mui/joy';
import type { LinkProps as NextLinkProps } from 'next/link';
import NextLink from 'next/link';

export type PageLinkProps = NextLinkProps & LinkProps;

export default function PageLink(props: PageLinkProps) {
	return <Link {...props} component={NextLink} />;
}
