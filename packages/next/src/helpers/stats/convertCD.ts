import { type StatKey } from '../../types/good';

export function convertCD(subStatArr: (StatKey | StatKey[])[]) {
	return subStatArr.map((subStat) => {
		if (typeof subStat === 'string') {
			if (subStat === 'critRD_') return ['critRate_', 'critDMG_'] as StatKey[];
		} else {
			const index = subStat.indexOf('critRD_');
			if (index !== -1) return subStat.toSpliced(index, 1, 'critRate_', 'critDMG_');
		}
		return subStat;
	});
}
