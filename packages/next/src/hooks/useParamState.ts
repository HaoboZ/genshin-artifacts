import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { isEmpty } from 'remeda';

export default function useParamState<T>(key: string, initialState: T): [T, (value: T) => void] {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const createQueryString = useCallback(
		(value: T) => {
			const obj = Object.fromEntries(searchParams);
			if (value === initialState) delete obj[key];
			else obj[key] = value as string;
			if (isEmpty(obj)) return '';
			return `?${new URLSearchParams(obj).toString()}`;
		},
		[key, searchParams, initialState],
	);

	return [
		(searchParams.get(key) as T) ?? initialState,
		(value) => router.push(`${pathname}${createQueryString(value)}`),
	];
}
