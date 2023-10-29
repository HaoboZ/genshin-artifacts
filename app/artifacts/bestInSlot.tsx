import StatChipArray from '@/components/statChipArray';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { Tier } from '@/src/types/data';
import type { ArtifactSetKey, SlotKey, StatKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import Link from 'next/link';
import { useMemo } from 'react';
import { filter, groupBy, map, pipe, reduce, sortBy } from 'remeda';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { statName } from './artifactData';

export default function BestInSlot({
	artifactSet,
	slot,
}: {
	artifactSet: ArtifactSetKey;
	slot: SlotKey;
}) {
	const priority = useAppSelector(pget('main.priority'));

	const characters = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		return pipe(
			charactersTier,
			Object.values<Tier>,
			filter(({ artifact }) => makeArray(artifact[0])[0] === artifactSet),
			sortBy(({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			}),
		);
	}, [artifactSet, priority]);

	const mainStats = useMemo(
		() =>
			characters.reduce(
				(acc, tier) => {
					const sandStat = makeArray(tier.mainStat.sands)[0];
					acc.sands[sandStat] = (acc.sands[sandStat] ?? 0) + 1;
					const gobletStat = makeArray(tier.mainStat.goblet)[0];
					acc.goblet[gobletStat] = (acc.goblet[gobletStat] ?? 0) + 1;
					const circletStat = makeArray(tier.mainStat.circlet)[0];
					acc.circlet[circletStat] = (acc.circlet[circletStat] ?? 0) + 1;
					return acc;
				},
				{ sands: {}, goblet: {}, circlet: {} },
			),
		[characters],
	);

	const subStatArr = useMemo(
		() =>
			pipe(
				characters,
				reduce(
					(res, { subStat }) => {
						subStat.forEach((statArr, index) =>
							makeArray(statArr).forEach((stat) => {
								if (!(stat in res) || res[stat] > index) res[stat] = index;
							}),
						);
						return res;
					},
					{} as Record<StatKey, number>,
				),
				Object.entries<number>,
				groupBy(pget('1')),
				Object.values<[string, number][]>,
				map((stat) => stat.flatMap(pget('0'))),
			),
		[characters],
	);

	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				{characters.map(({ key }) => (
					<CharacterImage
						key={key}
						character={charactersInfo[key]}
						size={50}
						component={Link}
						// @ts-ignore
						href={`/characters/${key}`}
					/>
				))}
			</Stack>
			{(!slot || slot === 'sands') && (
				<StatChipArray
					name='Sands'
					arr={Object.entries(mainStats.sands).map(
						([stat, count]) => `${statName[stat]} x${count}`,
					)}
				/>
			)}
			{(!slot || slot === 'goblet') && (
				<StatChipArray
					name='Goblet'
					arr={Object.entries(mainStats.goblet).map(
						([stat, count]) => `${statName[stat]} x${count}`,
					)}
				/>
			)}
			{(!slot || slot === 'circlet') && (
				<StatChipArray
					name='Circlet'
					arr={Object.entries(mainStats.circlet).map(
						([stat, count]) => `${statName[stat]} x${count}`,
					)}
				/>
			)}
			<StatChipArray mapStats breadcrumbs name='SubStats' arr={subStatArr} />
		</Stack>
	);
}
