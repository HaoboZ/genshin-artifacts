import { findIndex, includes } from 'lodash';

export default function arrDeepIndex(arr: (string | string[])[], str: string) {
	return findIndex(arr, (subArr) =>
		typeof subArr === 'string' ? subArr === str : includes(subArr, str),
	);
}
