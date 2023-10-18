import { useEffect } from 'react';
import { useFreshTick } from 'rooks';

export default function useEventListener(
	event:
		| { on: Function; off: Function }
		| { addListener: Function; removeListener: Function }
		| { addEventListener: Function; removeEventListener: Function },
	name: string | symbol | keyof WindowEventMap,
	listener: (...args: any[]) => void,
	callOnce?: boolean,
) {
	const tick = useFreshTick(listener);

	useEffect(() => {
		if (!event) return;
		// @ts-ignore
		const add = event.on || event.addListener || event.addEventListener;
		// @ts-ignore
		const remove = event.off || event.removeListener || event.removeEventListener;

		if (callOnce) tick();
		add.bind(event)(name, tick);
		return () => remove.bind(event)(name, tick);
	}, [!event]);
}
