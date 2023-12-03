import makeArray from './makeArray';

export default function strArrMatch(arr: string | string[], str: string, exact?: boolean) {
	if (arr === undefined) return true;
	arr = makeArray(arr);
	const index = arr.indexOf('critRD_');
	if (index !== -1) arr = arr.toSpliced(index, 1, 'critRate_', 'critDMG_');
	return exact ? arr.indexOf(str) === 0 : arr.indexOf(str) !== -1;
}
