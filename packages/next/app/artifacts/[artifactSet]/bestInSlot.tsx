import { buildsList } from '@/api/builds';
import { charactersInfo, useCharacters } from '@/api/characters';
import { statName } from '@/api/stats';
import PageLink from '@/components/page/pageLink';
import StatChipArray from '@/components/stats/statChipArray';
import getFirst from '@/helpers/getFirst';
import makeArray from '@/helpers/makeArray';
import useParamState from '@/hooks/useParamState';
import { type ArtifactSetKey, type SlotKey } from '@/types/good';
import { Stack, Typography } from '@mui/material';
import { Fragment, useMemo } from 'react';
import { capitalize, sortBy } from 'remeda';
import CharacterImage from '../../characters/characterImage';
import getArtifactSetBuild from '../getArtifactSetBuild';

export default function BestInSlot({
	group,
	artifactSet,
}: {
	group: number;
	artifactSet: ArtifactSetKey;
}) {
	const characters = useCharacters();

	const [slot] = useParamState<SlotKey>('slot', null);

	const builds = useMemo(
		() =>
			sortBy(
				buildsList.filter(
					(build) => getFirst(build.artifact) === artifactSet && build.group === group,
				),
				({ key }) => characters.findIndex((character) => character.key === key),
			),
		[artifactSet, group, characters],
	);

	const { mainStat, subStat } = useMemo(
		() => getArtifactSetBuild(builds, artifactSet),
		[builds, artifactSet],
	);

	if (!mainStat.sands[0].length) return null;

	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				{builds.map(({ key, mainStat, subStat, role }) => (
					<PageLink key={key} href={`/characters/${key}`}>
						<CharacterImage
							character={charactersInfo[key]}
							size={50}
							sx={{ border: key ? 0 : 1, borderColor: 'red' }}
							tooltip={
								<Fragment>
									<Typography variant='h6'>{role}</Typography>
									<Typography>
										{statName[getFirst(mainStat.sands)]} -{' '}
										{statName[getFirst(mainStat.goblet)]} -{' '}
										{statName[getFirst(mainStat.circlet)]}
									</Typography>
									<Typography>
										{subStat
											.map((statArr) =>
												makeArray(statArr)
													.map((stat) => statName[stat])
													.join('/'),
											)
											.join(' - ')}
									</Typography>
								</Fragment>
							}
						/>
					</PageLink>
				))}
			</Stack>
			{['sands', 'goblet', 'circlet'].map((slotType) => {
				if (slot && slot !== slotType) return null;
				if (!Object.keys(mainStat[slotType]).length) return null;

				return (
					<StatChipArray
						key={slotType}
						name={capitalize(slotType)}
						arr={Object.entries(
							mainStat[slotType][0].reduce((acc, curr) => {
								acc[curr] = (acc[curr] || 0) + 1;
								return acc;
							}, {}),
						).map(([stat, count]) => `${statName[stat]} x${count}`)}
					/>
				);
			})}
			{Boolean(subStat.length) && (
				<StatChipArray mapStats breadcrumbs name='SubStats' arr={subStat} />
			)}
		</Stack>
	);
}
