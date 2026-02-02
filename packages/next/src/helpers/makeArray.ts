export default function makeArray<T>(arr: T | T[]): T[] {
	return Array.isArray(arr) ? arr : [arr].filter(Boolean);
}
