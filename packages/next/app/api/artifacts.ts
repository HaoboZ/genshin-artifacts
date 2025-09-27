import pget from '@/src/helpers/pget';
import { useAppSelector } from '@/src/store/hooks';
import type { Build, DArtifact } from '@/src/types/data';
import type { ArtifactSetKey, SlotKey } from '@/src/types/good';
import { useMemo } from 'react';
import { filter, pipe, sortBy } from 'remeda';
import data from './artifacts.json';

export const artifactSetsInfo: Record<ArtifactSetKey, DArtifact> = data as any;

export const artifactSlotImages = {
	flower: 'https://static.wikia.nocookie.net/gensin-impact/images/2/2d/Icon_Flower_of_Life.png',
	plume: 'https://static.wikia.nocookie.net/gensin-impact/images/8/8b/Icon_Plume_of_Death.png',
	sands: 'https://static.wikia.nocookie.net/gensin-impact/images/9/9f/Icon_Sands_of_Eon.png',
	goblet:
		'https://static.wikia.nocookie.net/gensin-impact/images/3/37/Icon_Goblet_of_Eonothem.png',
	circlet: 'https://static.wikia.nocookie.net/gensin-impact/images/6/64/Icon_Circlet_of_Logos.png',
};

export const missingArtifactSets: Partial<Record<ArtifactSetKey, Build>> = {
	EchoesOfAnOffering: {
		key: 'Traveler',
		role: 'DPS',
		weapon: [],
		group: 0,
		artifact: ['EchoesOfAnOffering'],
		mainStat: { sands: 'atk_', goblet: 'hydro_dmg_', circlet: 'critRD_' },
		subStat: ['critRD_', 'atk_', 'enerRech_', 'hp_', 'eleMas'],
	},
	BloodstainedChivalry: {
		key: 'Traveler',
		role: 'DPS',
		weapon: [],
		group: 0,
		artifact: ['BloodstainedChivalry'],
		mainStat: { sands: 'atk_', goblet: 'physical_dmg_', circlet: 'critRD_' },
		subStat: ['critRD_', 'atk_', 'enerRech_'],
	},
	NightOfTheSkysUnveiling: {
		key: 'Traveler',
		role: 'DPS',
		weapon: [],
		group: 0,
		artifact: ['NightOfTheSkysUnveiling'],
		mainStat: { sands: 'atk_', goblet: 'atk_', circlet: 'critRD_' },
		subStat: ['enerRech_', 'atk_', 'critRD_', 'eleMas'],
	},
};

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
	const artifacts = useAppSelector(pget('good.artifacts'));

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
					[pget('level'), 'desc'],
				),
			),
		[artifacts, artifactSet, rarityType, slot],
	);
}
