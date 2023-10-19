import { isEmpty } from 'lodash';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

export default function useParamState(
	key: string,
	initialState: string,
): [string, (value: string) => void] {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const createQueryString = useCallback(
		(value: string) => {
			const obj = Object.fromEntries(searchParams);
			if (value === initialState) delete obj[key];
			else obj[key] = value;
			if (isEmpty(obj)) return '';
			return `?${new URLSearchParams(obj).toString()}`;
		},
		[key, searchParams],
	);

	return [
		searchParams.get(key) ?? initialState,
		(value) => router.push(`${pathname}${createQueryString(value)}`),
	];
}
