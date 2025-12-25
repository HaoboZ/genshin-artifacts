import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
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
		case 'string':
			return {
				serialize: (v) => v as string,
				deserialize: (v) => v as T,
			};
		default:
			return {
				serialize: (v) => JSON.stringify(v),
				deserialize: (v) => JSON.parse(v),
			};
	}
}

export default function useParamState<T>(
	key: string,
	initialState: T,
	serializer?: Serializer<T>,
): [T, (value: T) => void] {
	const router = useRouter();
	const pathname = usePathname();
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
			if (isEmpty(obj)) return '';
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

	return [currentValue, (value) => router.push(`${pathname}${createQueryString(value)}`)];
}
