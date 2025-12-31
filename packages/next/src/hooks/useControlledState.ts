import { type Dispatch, type SetStateAction, useState } from 'react';

// allows a component to be optionally controlled or not controlled
export default function useControlledState<S>(defaultState?: S): [S, Dispatch<SetStateAction<S>>];
export default function useControlledState<S>(
	state: S,
	setState: Dispatch<SetStateAction<S>>,
): [S, Dispatch<SetStateAction<S>>];
export default function useControlledState<S>(state?: S, setState?: Dispatch<SetStateAction<S>>) {
	const controlledState = useState(state);
	if (setState) return [state, setState];
	return controlledState;
}
