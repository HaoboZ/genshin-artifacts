export default function strArrMatch(arr: string | string[], str: string) {
	return arr === 'string' ? arr === str : arr?.indexOf(str) !== -1;
}
