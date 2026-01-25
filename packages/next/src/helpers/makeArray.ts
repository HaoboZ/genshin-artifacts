export default function makeArray<T>(arr: T | T[]): T[] {
	return Array.isArray(arr) ? structuredClone(arr) : [arr].filter(Boolean);
}
