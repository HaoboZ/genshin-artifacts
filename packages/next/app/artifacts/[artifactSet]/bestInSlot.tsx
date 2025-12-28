import { charactersInfo, useCharacters } from '@/api/characters';
import { statName } from '@/api/stats';
import PageLink from '@/components/page/pageLink';
import StatChipArray from '@/components/stats/statChipArray';
import useParamState from '@/hooks/useParamState';
import makeArray from '@/src/helpers/makeArray';
import { type ArtifactSetKey, type SlotKey } from '@/src/types/good';
import { Stack, Typography } from '@mui/material';
import { capitalCase } from 'change-case';
import { Fragment, useMemo } from 'react';
import CharacterImage from '../../characters/characterImage';
import getArtifactSetBuild from '../getArtifactSetBuild';

export default function BestInSlot({
	group,
	artifactSet,
}: {
	group: number;
	artifactSet: ArtifactSetKey;
}) {
	const characters = useCharacters({ artifactSet }).filter((x) => x.group === group);

	const [slot] = useParamState<SlotKey>('slot', null);

	const { mainStat, subStat, role } = useMemo(
		() => getArtifactSetBuild(characters, artifactSet, group),
		[characters, artifactSet, group],
	);

	if (!mainStat.sands[0].length) return null;

	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				{characters.map(({ key, level, mainStat, subStat }) => (
					<PageLink key={key} href={`/characters/${key}`}>
						<CharacterImage
							character={charactersInfo[key]}
							size={50}
							sx={{ border: level ? 0 : 1, borderColor: 'red' }}
							tooltip={
								<Fragment>
									<Typography variant='h6'>{role}</Typography>
									<Typography>
										{statName[makeArray(mainStat.sands)[0]]} -{' '}
										{statName[makeArray(mainStat.goblet)[0]]} -{' '}
										{statName[makeArray(mainStat.circlet)[0]]}
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
						name={capitalCase(slotType)}
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
