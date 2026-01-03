import { type RefObject, useCallback, useState } from 'react';
import { useDidMount, useMutationObserver } from 'rooks';
import useResizeObserver from './useResizeObserver';

export default function useBoundingClientRect(ref: RefObject<HTMLElement>): DOMRect {
	const [domRect, setDomRect] = useState<DOMRect>(null);

	const update = useCallback(() => {
		setDomRect(ref.current ? ref.current.getBoundingClientRect() : null);
	}, [ref]);

	useDidMount(update);

	useMutationObserver(ref, update);
	useResizeObserver(ref, update);

	return domRect;
}
