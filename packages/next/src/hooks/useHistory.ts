import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import useEventListener from './useEventListener';

export default function useHistory<S>(state: S, setState: Dispatch<SetStateAction<S>>) {
	const [history, setHistory] = useState<S[]>([structuredClone(state)]);
	const [index, setIndex] = useState(0);
	const [navigating, setNavigating] = useState(false);

	useEffect(() => {
		if (navigating) {
			setNavigating(false);
			return;
		}

		setHistory((history) => {
			const truncated = history.slice(0, index + 1);
			return [...truncated, structuredClone(state)];
		});
		setIndex((index) => index + 1);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state]);

	useEventListener(typeof window !== 'undefined' ? window : null, 'keydown', (e) => {
		if (!e.ctrlKey) return;

		if (e.key === 'z') {
			e.preventDefault();
			setIndex((index) => {
				if (index <= 0) return index;
				const newIndex = index - 1;
				setNavigating(true);
				setState(history[newIndex]);
				return newIndex;
			});
		} else if (e.key === 'y' || e.key === 'Z') {
			e.preventDefault();
			setIndex((index) => {
				if (index >= history.length - 1) return index;
				const newIndex = index + 1;
				setNavigating(true);
				setState(history[newIndex]);
				return newIndex;
			});
		}
	});
}
