import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

export default function useControlled<T>(initialState?: T): [T, Dispatch<SetStateAction<T>>];
export default function useControlled<T>(
	state: T,
	setState: Dispatch<SetStateAction<T>>,
): [T, Dispatch<SetStateAction<T>>];
export default function useControlled<T>(state?: T, setState?: Dispatch<SetStateAction<T>>) {
	const states = useState(state);
	return setState ? [state, setState] : states;
}
