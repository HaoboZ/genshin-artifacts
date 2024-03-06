import StatChipArray from '@/components/statChipArray';
import makeArray from '@/src/helpers/makeArray';
import type { ArtifactSetKey, SlotKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import { capitalCase } from 'change-case';
import Link from 'next/link';
import { useMemo } from 'react';
import { charactersInfo } from '../../characters/characterData';
import CharacterImage from '../../characters/characterImage';
import useCharactersSorted from '../../characters/useCharactersSorted';
import { statName } from '../artifactData';
import getArtifactSetTier from '../getArtifactSetTier';

export default function BestInSlot({
	artifactSet,
	slot,
}: {
	artifactSet: ArtifactSetKey;
	slot: SlotKey;
}) {
	const characters = useCharactersSorted();
	const charactersFiltered = useMemo(
		() => characters.filter(({ artifact }) => makeArray(artifact[0])[0] === artifactSet),
		[characters],
	);

	const { mainStats, subStats } = getArtifactSetTier(charactersFiltered, artifactSet);

	return (
		<Stack spacing={1}>
			<Stack direction='row' spacing={1}>
				{charactersFiltered.map(({ key, mainStat }) => (
					<Link key={key} href={`/characters/${key}`}>
						<CharacterImage
							character={charactersInfo[key]}
							size={50}
							tooltip={`${statName[makeArray(mainStat.sands)[0]]} - ${statName[makeArray(mainStat.goblet)[0]]} - ${statName[makeArray(mainStat.circlet)[0]]}`}
						/>
					</Link>
				))}
			</Stack>
			{['sands', 'goblet', 'circlet'].map((slotType) => {
				if (slot && slot !== slotType) return null;
				if (!Object.keys(mainStats[slotType]).length) return null;

				return (
					<StatChipArray
						key={slotType}
						name={capitalCase(slotType)}
						arr={Object.entries(mainStats[slotType]).map(
							([stat, count]) => `${statName[stat]} x${count}`,
						)}
					/>
				);
			})}
			{Boolean(subStats.length) && (
				<StatChipArray mapStats breadcrumbs name='SubStats' arr={subStats} />
			)}
		</Stack>
	);
}
