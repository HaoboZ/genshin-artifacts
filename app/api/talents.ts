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
