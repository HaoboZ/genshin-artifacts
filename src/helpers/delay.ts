export function debounce<F extends (...args: any[]) => any>(fn: F, delay = 300) {
	let timer: ReturnType<typeof setTimeout>;

	return ((...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), delay);
	}) as F;
}

export function throttle<F extends (...args: any[]) => any>(fn: F, delay = 300) {
	let ready = true;
	let _args: any[];

	return ((...args) => {
		_args = args;
		if (!ready) return;
		ready = false;
		setTimeout(() => {
			ready = true;
			fn(..._args);
		}, delay);
	}) as F;
}
