import { useIsClient } from '@uidotdev/usehooks';
import type { ReactNode } from 'react';
import { Fragment } from 'react';

export default function ClientOnly({ children }: { children: ReactNode }) {
	const isClient = useIsClient();

	// Render children if on client side, otherwise return null
	return isClient ? <Fragment>{children}</Fragment> : null;
}
