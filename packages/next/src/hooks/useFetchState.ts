import axios from 'axios';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

// Fetches the url data into the initial state
export default function useFetchState<S>(
	url: string | null,
	defaultState?: S,
): [S | null, Dispatch<SetStateAction<S | null>>] {
	const [state, setState] = useState<S | null>(defaultState ?? null);

	useEffect(() => {
		if (!url) {
			setState(defaultState ?? null);
			return;
		}

		const controller = new AbortController();
		setState(null);
		axios
			.get<S>(url, { signal: controller.signal })
			.then(({ data }) => setState(data))
			.catch(() => {
				if (!controller.signal.aborted) setState(defaultState ?? null);
			});

		return () => controller.abort();
	}, [url, defaultState]);

	return [state, setState];
}
