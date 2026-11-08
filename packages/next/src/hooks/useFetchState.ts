import axios from 'axios';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

// Fetches the url data into the initial state
export default function useFetchState<S>(
	url: string,
	defaultState?: S,
): [S, Dispatch<SetStateAction<S>>] {
	const [state, setState] = useState<S>(null);

	useEffect(() => {
		setState(null);
		(async () => {
			try {
				const { data } = await axios.get(url);
				setState(data);
			} catch {
				setState(defaultState);
			}
		})();
	}, [url]);

	return [state, setState];
}
