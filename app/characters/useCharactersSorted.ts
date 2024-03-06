import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { Tier } from '@/src/types/data';
import { useMemo } from 'react';
import { pipe, sortBy } from 'remeda';
import { charactersTier } from './characterData';

export default function useCharactersSorted() {
	const priority = useAppSelector(pget('main.priority'));

	return useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		return pipe(
			charactersTier,
			Object.values<Tier>,
			sortBy(({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			}),
		);
	}, [priority]);
}
