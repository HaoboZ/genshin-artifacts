import ChipArray from '@/components/chipArray';
import makeArray from '@/src/helpers/makeArray';
import { useAppSelector } from '@/src/store/hooks';
import type { ArtifactSetKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import { filter, flatMap, groupBy, sortBy, uniq } from 'lodash';
import Link from 'next/link';
import { useMemo } from 'react';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';

export default function BestInSlot({ artifactSet }: { artifactSet: ArtifactSetKey }) {
	const priority = useAppSelector(({ main }) => main.priority);

	const characters = useMemo(() => {
		const priorityIndex = priority.flat();
		return sortBy(
			filter(charactersTier, ({ artifact }) => makeArray(artifact[0])[0] === artifactSet),
			({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			},
		);
	}, [artifactSet, priority]);

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
						href={`characters/${key}`}
					/>
				))}
			</Stack>
			<ChipArray name='Sands' arr={sortBy(uniq(flatMap(characters, 'mainStat.sands')))} />
			<ChipArray name='Goblet' arr={sortBy(uniq(flatMap(characters, 'mainStat.goblet')))} />
			<ChipArray name='Circlet' arr={sortBy(uniq(flatMap(characters, 'mainStat.circlet')))} />
			<ChipArray
				breadcrumbs
				name='SubStats'
				arr={Object.values(
					groupBy(
						Object.entries(
							characters.reduce((res, { subStat }) => {
								subStat.forEach((statArr, index) =>
									makeArray(statArr).forEach((stat) => {
										if (!(stat in res) || res[stat] > index) res[stat] = index;
									}),
								);
								return res;
							}, {}),
						),
						1,
					),
				).map((stat) => flatMap(stat, '0'))}
			/>
		</Stack>
	);
}
