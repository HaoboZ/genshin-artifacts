import makeArray from '@/src/helpers/makeArray';
import { useAppSelector } from '@/src/store/hooks';
import type { ArtifactSetKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import Link from 'next/link';
import { sortBy, sortByPath } from 'rambdax';
import { useMemo } from 'react';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { artifactSetsInfo } from './artifactData';
import ArtifactSetImage from './artifactSetImage';

export default function BestInSlotAll({
	setArtifactSet,
}: {
	setArtifactSet: (value: ArtifactSetKey) => void;
}) {
	const priority = useAppSelector(({ main }) => main.priority);

	const priorityIndex = useMemo(() => Object.values(priority).flat(), [priority]);

	return sortByPath('order', Object.values(artifactSetsInfo))
		.toReversed()
		.map((artifactSet) => (
			<Stack key={artifactSet.key} direction='row'>
				<ArtifactSetImage
					artifactSet={artifactSet}
					size={50}
					sx={{ 'mr': 1, ':hover': { cursor: 'pointer' } }}
					onClick={() => setArtifactSet(artifactSet.key)}
				/>
				{sortBy(
					({ key }) => {
						const index = priorityIndex.indexOf(key);
						return index === -1 ? Infinity : index;
					},
					Object.values(charactersTier).filter(
						({ artifact }) => makeArray(artifact[0])[0] === artifactSet.key,
					),
				).map(({ key }) => (
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
		));
}
