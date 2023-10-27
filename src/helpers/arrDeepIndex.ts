export default function arrDeepIndex(arr: (string | string[])[], str: string) {
	return arr.findIndex((subArr) =>
		typeof subArr === 'string' ? subArr === str : subArr?.includes(str),
	);
}
