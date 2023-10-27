import type { Get } from 'type-fest';

export default function pget<BaseType, Path extends string | string[]>(
	data: BaseType,
	path: Path,
	_default?: any,
): Get<BaseType, Path>;
export default function pget<BaseType, Path extends string | string[]>(
	path: Path,
	_default?: any,
): (data: BaseType) => Get<BaseType, Path>;
export default function pget(data, path?, _default?) {
	if (typeof data === 'string') return (obj) => internal(obj, data, path);
	return internal(data, path, _default);
}

function internal(data, path, _default) {
	let counter = 0;
	const pathArr = typeof path === 'string' ? path.split('.') : path;

	while (counter < pathArr.length) {
		if (data === null || data === undefined) return _default;
		data = data[pathArr[counter++]];
	}

	if (data === undefined) return _default;
	return data;
}
