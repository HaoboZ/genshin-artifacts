import type { Tier } from '@/src/types/data';
import type { IArtifact } from '@/src/types/good';
import { useMemo } from 'react';
import { charactersTier } from '../characters/characterData';
import useCharactersSorted from '../characters/useCharactersSorted';
import getArtifactSetTier from './getArtifactSetTier';
import { getPotentialTier } from './getArtifactTier';

export default function useArtifactsTiered(artifacts: IArtifact[]) {
	const characters = useCharactersSorted();

	return useMemo(
		() =>
			artifacts.map((artifact) => {
				const { mainStats, subStats } = getArtifactSetTier(characters, artifact.setKey);

				return {
					...artifact,
					tier: getPotentialTier(
						artifact.location
							? charactersTier[artifact.location]
							: ({
									artifact: [artifact.setKey],
									mainStat: {
										[artifact.slotKey]: mainStats[artifact.slotKey]
											? Object.keys(mainStats[artifact.slotKey])
											: ['hp', 'atk'],
									},
									subStat: subStats,
								} as Tier),
						artifact,
					),
				};
			}),
		[artifacts, characters],
	);
}
