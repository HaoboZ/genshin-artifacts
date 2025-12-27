import data from '@/public/data/artifacts.json';
import { useAppSelector } from '@/src/store/hooks';
import { type Build, type DArtifact } from '@/src/types/data';
import { type ArtifactSetKey, type SlotKey } from '@/src/types/good';
import { useMemo } from 'react';
import { filter, pipe, prop, sortBy } from 'remeda';

export const artifactSetsInfo: Record<ArtifactSetKey, DArtifact> = data as any;

export const artifactSlotImages = {
	flower: 'https://static.wikia.nocookie.net/gensin-impact/images/2/2d/Icon_Flower_of_Life.png',
	plume: 'https://static.wikia.nocookie.net/gensin-impact/images/8/8b/Icon_Plume_of_Death.png',
	sands: 'https://static.wikia.nocookie.net/gensin-impact/images/9/9f/Icon_Sands_of_Eon.png',
	goblet:
		'https://static.wikia.nocookie.net/gensin-impact/images/3/37/Icon_Goblet_of_Eonothem.png',
	circlet: 'https://static.wikia.nocookie.net/gensin-impact/images/6/64/Icon_Circlet_of_Logos.png',
};

export const missingArtifactSets: Partial<Record<ArtifactSetKey, Build>> = {};

export const artifactSlotOrder: SlotKey[] = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

export function useArtifacts({
	artifactSet,
	rarity: rarityType,
	slot,
}: {
	artifactSet?: ArtifactSetKey;
	rarity?: number;
	slot?: SlotKey;
}) {
	const artifacts = useAppSelector(prop('good', 'artifacts'));

	return useMemo(
		() =>
			pipe(
				artifacts,
				filter(
					({ setKey, rarity, slotKey }) =>
						(!artifactSet || artifactSet === setKey) &&
						(!rarityType || rarity === rarityType) &&
						(!slot || slot === slotKey),
				),
				sortBy(
					[({ setKey }) => artifactSetsInfo[setKey].group, 'desc'],
					[prop('level'), 'desc'],
				),
			),
		[artifacts, artifactSet, rarityType, slot],
	);
}
