import axios from 'axios';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

// fetches the url data into the initial state
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	return [state, setState];
}
