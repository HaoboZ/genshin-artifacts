import talent from './talent.json';
import weekly from './weekly.json';

export const talentsInfo: { name: string; image: string; location: string; day: number }[] = talent;
export const weeklyInfo: { name: string; items: { name: string; image: string }[] }[] = weekly;

export const weeklyRequirement = {
	undefined: 6,
	1: 6,
	2: 6,
	3: 6,
	4: 6,
	5: 6,
	6: 6,
	7: 5,
	8: 4,
	9: 2,
	10: 0,
};

export const weeklyCount = {
	undefined: 0,
	1: 0,
	2: 0,
	3: 0,
	4: 0,
	5: 0,
	6: 1,
	7: 1,
	8: 2,
	9: 2,
	10: 0,
};
