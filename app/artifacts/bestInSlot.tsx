import StatChipArray from '@/components/statChipArray';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { Tier } from '@/src/types/data';
import type { ArtifactSetKey, SlotKey, StatKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import Link from 'next/link';
import { Fragment, useMemo } from 'react';
import { filter, groupBy, map, pipe, reduce, sortBy, uniq } from 'remeda';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { missingArtifactSets, statName } from './artifactData';

export default function BestInSlot({
	artifactSet,
	slot,
}: {
	artifactSet: ArtifactSetKey;
	slot: SlotKey;
}) {
	const priority = useAppSelector(pget('main.priority'));

	const [characters, charactersSets] = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		const characters = pipe(
			charactersTier,
			Object.values<Tier>,
			filter(({ artifact }) => makeArray(artifact[0])[0] === artifactSet),
			sortBy(({ key }) => {
				const index = priorityIndex.indexOf(key);
				return index === -1 ? Infinity : index;
			}),
		);
		return [characters, characters.length ? characters : [missingArtifactSets[artifactSet]]];
	}, [artifactSet, priority]);

	const mainStats = useMemo(
		() =>
			charactersSets.reduce(
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
		[charactersSets],
	);

	const subStatArr = useMemo(
		() =>
			pipe(
				charactersSets,
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
		[charactersSets],
	);

	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				{characters.map(({ key }) => (
					<Link key={key} href={`/characters/${key}`}>
						<CharacterImage character={charactersInfo[key]} size={50} />
					</Link>
				))}
			</Stack>
			{!slot && (
				<Fragment>
					<StatChipArray
						mapStats
						name='Sands'
						arr={uniq(characters.flatMap(pget('mainStat.sands'))).sort()}
					/>
					<StatChipArray
						mapStats
						name='Goblet'
						arr={uniq(characters.flatMap(pget('mainStat.goblet'))).sort()}
					/>
					<StatChipArray
						mapStats
						name='Circlet'
						arr={uniq(characters.flatMap(pget('mainStat.circlet'))).sort()}
					/>
				</Fragment>
			)}
			{slot === 'sands' && (
				<StatChipArray
					name='Sands'
					arr={Object.entries(mainStats.sands).map(
						([stat, count]) => `${statName[stat]} x${count}`,
					)}
				/>
			)}
			{slot === 'goblet' && (
				<StatChipArray
					name='Goblet'
					arr={Object.entries(mainStats.goblet).map(
						([stat, count]) => `${statName[stat]} x${count}`,
					)}
				/>
			)}
			{slot === 'circlet' && (
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
