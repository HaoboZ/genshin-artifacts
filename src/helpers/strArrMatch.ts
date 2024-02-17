import arrDeepIndex from './arrDeepIndex';
import makeArray from './makeArray';

export default function strArrMatch(arr: string | string[], str: string, exact?: boolean) {
	if (arr === undefined) return true;
	arr = makeArray(arr);
	const index = arr.indexOf('critRD_');
	if (index !== -1) arr[index] = ['critRate_', 'critDMG_'] as any;
	return exact ? arrDeepIndex(arr, str) === 0 : arrDeepIndex(arr, str) !== -1;
}
