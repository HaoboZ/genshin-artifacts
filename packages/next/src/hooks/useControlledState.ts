import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

// allows a component to be optionally controlled or not controlled
export default function useControlledState<T>(initialState?: T): [T, Dispatch<SetStateAction<T>>];
export default function useControlledState<T>(
	state: T,
	setState: Dispatch<SetStateAction<T>>,
): [T, Dispatch<SetStateAction<T>>];
export default function useControlledState<T>(state?: T, setState?: Dispatch<SetStateAction<T>>) {
	if (setState) return [state, setState];
	// eslint-disable-next-line react-hooks/rules-of-hooks
	return useState(state);
}
