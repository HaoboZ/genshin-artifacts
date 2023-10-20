import type { ISubstat } from '../good';
import { statName, stats } from '../resources/stats';
import PercentBar from './percentBar';

export default function SubStatBar({ substat, rarity }: { substat: ISubstat; rarity: number }) {
	return (
		<PercentBar key={substat.key} p={substat.value / stats[substat.key][rarity]}>
			{statName[substat.key]}: {substat.value.toString()}
		</PercentBar>
	);
}
