export default function makeArray<T>(arr: T | T[]) {
	return Array.isArray(arr) ? arr : [arr];
}
