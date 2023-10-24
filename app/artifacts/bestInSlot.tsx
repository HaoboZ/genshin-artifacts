import ChipArray from '@/components/chipArray';
import makeArray from '@/src/helpers/makeArray';
import { useAppSelector } from '@/src/store/hooks';
import type { ArtifactSetKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import Link from 'next/link';
import { groupBy, path, sortBy, uniq } from 'rambdax';
import { useMemo } from 'react';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';

export default function BestInSlot({ artifactSet }: { artifactSet: ArtifactSetKey }) {
	const priority = useAppSelector(({ main }) => main.priority);

	const characters = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();
		return sortBy(
			({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			},
			Object.values(charactersTier).filter(
				({ artifact }) => makeArray(artifact[0])[0] === artifactSet,
			),
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
			<ChipArray
				name='Sands'
				arr={uniq(characters.flatMap(path<string>('mainStat.sands'))).sort()}
			/>
			<ChipArray
				name='Goblet'
				arr={uniq(characters.flatMap(path<string>('mainStat.goblet'))).sort()}
			/>
			<ChipArray
				name='Circlet'
				arr={uniq(characters.flatMap(path<string>('mainStat.circlet'))).sort()}
			/>
			<ChipArray
				breadcrumbs
				name='SubStats'
				arr={Object.values(
					groupBy(
						(stat: string[]) => stat[1],
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
					),
				).map((stat) => stat.flatMap((stat) => stat[0]))}
			/>
		</Stack>
	);
}
