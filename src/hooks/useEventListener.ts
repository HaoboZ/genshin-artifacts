import { useEffect, useRef } from 'react';

export default function useEventListener(
	event:
		| { on: Function; off: Function }
		| { addListener: Function; removeListener: Function }
		| { addEventListener: Function; removeEventListener: Function },
	name: string | symbol | keyof WindowEventMap,
	listener: (...args: any[]) => void,
	callOnce?: boolean,
) {
	const ref = useRef(listener);

	useEffect(() => {
		ref.current = listener;
	}, [listener]);

	useEffect(() => {
		if (!event) return;
		// @ts-ignore
		const add = event.addEventListener || event.addListener || event.on;
		// @ts-ignore
		const remove = event.removeEventListener || event.removeListener || event.off;

		if (callOnce) ref.current();
		add.bind(event)(name, ref);
		return () => remove.bind(event)(name, ref);
	}, [Boolean(event), name]);
}
