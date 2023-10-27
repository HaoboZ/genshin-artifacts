import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import { DArtifact, Tier } from '@/src/types/data';
import type { ArtifactSetKey } from '@/src/types/good';
import { Stack } from '@mui/joy';
import Link from 'next/link';
import { useMemo } from 'react';
import { filter, pipe, sortBy } from 'remeda';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import { artifactSetsInfo } from './artifactData';
import ArtifactSetImage from './artifactSetImage';

export default function BestInSlotAll({
	setArtifactSet,
}: {
	setArtifactSet: (value: ArtifactSetKey) => void;
}) {
	const priority = useAppSelector(pget('main.priority'));

	const characterFilter = useMemo(() => {
		const priorityIndex = Object.values(priority).flat();

		return (artifactSet: DArtifact) =>
			pipe(
				charactersTier,
				Object.values<Tier>,
				filter(({ artifact }) => makeArray(artifact[0])[0] === artifactSet.key),
				sortBy(({ key }) => {
					const index = priorityIndex.indexOf(key);
					return index === -1 ? Infinity : index;
				}),
			);
	}, [priority]);

	return sortBy(Object.values(artifactSetsInfo), ({ order }) => order).map((artifactSet) => (
		<Stack key={artifactSet.key} direction='row'>
			<ArtifactSetImage
				artifactSet={artifactSet}
				size={50}
				sx={{ 'mr': 1, ':hover': { cursor: 'pointer' } }}
				onClick={() => setArtifactSet(artifactSet.key)}
			/>
			{characterFilter(artifactSet).map(({ key }) => (
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
