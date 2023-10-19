import type { ISubstat } from '../good';
import { statName, stats } from '../resources/stats';
import PercentBar from './percentBar';

export default function SubStatBar({
	substat,
	rarity,
	showValue,
}: {
	substat: ISubstat;
	rarity: number;
	showValue?: boolean;
}) {
	return (
		<PercentBar key={substat.key} p={substat.value / stats[substat.key][rarity]}>
			{`${statName[substat.key]}${showValue ? `: ${substat.value}` : ''}`}
		</PercentBar>
	);
}
