import { type RefObject, useEffect, useRef } from 'react';

export default function useResizeObserver(
	ref: RefObject<HTMLElement>,
	callback: ResizeObserverCallback,
): void {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (ref.current) {
			const observer = new ResizeObserver((...args) => callbackRef.current(...args));
			observer.observe(ref.current);
			return () => observer.disconnect();
		}
	}, [ref]);
}
