import { statName, statsMax } from '@/api/stats';
import { type ISubstat } from '../../types/good';
import PercentBar from './percentBar';

export default function SubStatBar({
	substat,
	unactivated,
}: {
	substat: ISubstat;
	unactivated?: boolean;
}) {
	return (
		<PercentBar
			key={substat.key}
			p={substat.value / statsMax[substat.key]}
			sx={unactivated ? { color: 'text.disabled' } : undefined}>
			{statName[substat.key]}: {substat.value?.toString()}
		</PercentBar>
	);
}
