import { type RefObject, useEffect } from 'react';

export default function useResizeObserver(
	ref: RefObject<HTMLElement>,
	callback: ResizeObserverCallback,
): void {
	useEffect(() => {
		if (ref.current) {
			const observer = new ResizeObserver(callback);
			observer.observe(ref.current);
			return () => observer.disconnect();
		}
	}, [callback, ref]);
}
