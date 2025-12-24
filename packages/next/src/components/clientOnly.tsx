import { useIsClient } from '@uidotdev/usehooks';
import { type ReactNode } from 'react';

export default function ClientOnly({ children }: { children: ReactNode }) {
	const isClient = useIsClient();

	if (!isClient) return null;
	return children;
}
