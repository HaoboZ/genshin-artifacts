import { findIndex } from 'rambdax';

export default function arrDeepIndex(arr: (string | string[])[], str: string) {
	return findIndex(
		(subArr) => (typeof subArr === 'string' ? subArr === str : subArr?.includes(str)),
		arr,
	);
}
