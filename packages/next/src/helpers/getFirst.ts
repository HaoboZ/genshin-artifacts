export default function getFirst<T>(arr: T | (T | T[])[]): T {
	if (!Array.isArray(arr)) return arr;
	return getFirst(arr[0]);
}
