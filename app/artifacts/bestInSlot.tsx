import ChipArray from '@/components/chipArray';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { Tier } from '@/src/types/data';
import type { ArtifactSetKey, StatKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import Link from 'next/link';
import { useMemo } from 'react';
import { filter, groupBy, map, pipe, reduce, sortBy, uniq } from 'remeda';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';

export default function BestInSlot({ artifactSet }: { artifactSet: ArtifactSetKey }) {
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
			<ChipArray name='Sands' arr={uniq(characters.flatMap(pget('mainStat.sands'))).sort()} />
			<ChipArray name='Goblet' arr={uniq(characters.flatMap(pget('mainStat.goblet'))).sort()} />
			<ChipArray
				name='Circlet'
				arr={uniq(characters.flatMap(pget('mainStat.circlet'))).sort()}
			/>
			<ChipArray breadcrumbs name='SubStats' arr={subStatArr} />
		</Stack>
	);
}
