import { useSearchParams } from 'next/navigation';
import { type Dispatch, useCallback, useMemo } from 'react';
import { isEmpty } from 'remeda';

type Serializer<T> = {
	serialize: (value: T) => string;
	deserialize: (value: string) => T;
};

function getSerializer<T>(initialState: T): Serializer<T> {
	switch (typeof initialState) {
		case 'number':
			return {
				serialize: (v) => String(v),
				deserialize: (v) => Number(v) as T,
			};
		default:
			return {
				serialize: (v) => v as string,
				deserialize: (v) => v as T,
			};
	}
}

export default function useParamState<T>(
	key: string,
	initialState: T,
	serializer?: Serializer<T>,
): [T, Dispatch<T>] {
	const searchParams = useSearchParams();

	const { serialize, deserialize } = serializer ?? getSerializer(initialState);

	const createQueryString = useCallback(
		(value: T) => {
			const obj = Object.fromEntries(searchParams);
			if (value === initialState) {
				delete obj[key];
			} else {
				obj[key] = serialize(value);
			}
			if (isEmpty(obj)) return '?';
			return `?${new URLSearchParams(obj).toString()}`;
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[searchParams, key, initialState],
	);

	const currentValue = useMemo(() => {
		const param = searchParams.get(key);
		return param !== null ? deserialize(param) : initialState;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams, key, initialState]);

	return [
		currentValue,
		(value) => window.history.pushState(null, '', `${createQueryString(value)}`),
	];
}
