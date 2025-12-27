import { Link, type LinkProps } from '@mui/material';
import NextLink, { type LinkProps as NextLinkProps } from 'next/link';

export type PageLinkProps = NextLinkProps & LinkProps;

export default function PageLink(props: PageLinkProps) {
	return <Link {...props} component={NextLink} />;
}
