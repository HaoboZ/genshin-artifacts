import { statName, statsMax } from '@/app/artifacts/artifactData';
import type { ISubstat } from '../types/good';
import PercentBar from './percentBar';

export default function SubStatBar({ substat, rarity }: { substat: ISubstat; rarity: number }) {
	return (
		<PercentBar key={substat.key} p={substat.value / statsMax[substat.key][rarity]}>
			{statName[substat.key]}: {substat.value.toString()}
		</PercentBar>
	);
}
