import { statName, statsMax } from '@/api/stats';
import type { ISubstat } from '../types/good';
import PercentBar from './percentBar';

export default function SubStatBar({ substat }: { substat: ISubstat }) {
	return (
		<PercentBar key={substat.key} p={substat.value / statsMax[substat.key]}>
			{statName[substat.key]}: {substat.value.toString()}
		</PercentBar>
	);
}
