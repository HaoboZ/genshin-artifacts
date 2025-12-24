import { type Dispatch, type SetStateAction, useState } from 'react';

// allows a component to be optionally controlled or not controlled
export default function useControlledState<S>(initialState?: S): [S, Dispatch<SetStateAction<S>>];
export default function useControlledState<S>(
	state: S,
	setState: Dispatch<SetStateAction<S>>,
): [S, Dispatch<SetStateAction<S>>];
export default function useControlledState<S>(state?: S, setState?: Dispatch<SetStateAction<S>>) {
	if (setState) return [state, setState];
	// eslint-disable-next-line react-hooks/rules-of-hooks
	return useState(state);
}
