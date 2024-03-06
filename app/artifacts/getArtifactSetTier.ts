import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import type { Tier } from '@/src/types/data';
import type { ArtifactSetKey, StatKey } from '@/src/types/good';
import { groupBy, map, pipe, reduce, take } from 'remeda';
import { missingArtifactSets } from './artifactData';

export default function getArtifactSetTier(characterTiers: Tier[], artifactSet: ArtifactSetKey) {
	const charactersFiltered = characterTiers.filter(
		({ artifact }) => makeArray(artifact[0])[0] === artifactSet,
	);

	const charactersSets = charactersFiltered.length
		? charactersFiltered
		: [missingArtifactSets[artifactSet]].filter(Boolean);

	return {
		mainStats: charactersSets.reduce(
			(acc, tier) => {
				const sandStat = makeArray(tier.mainStat.sands)[0];
				for (const stat of makeArray(sandStat)) {
					acc.sands[stat] = (acc.sands[stat] ?? 0) + 1;
				}
				const gobletStat = makeArray(tier.mainStat.goblet)[0];
				for (const stat of makeArray(gobletStat)) {
					acc.goblet[stat] = (acc.goblet[stat] ?? 0) + 1;
				}
				const circletStat = makeArray(tier.mainStat.circlet)[0];
				for (const stat of makeArray(circletStat)) {
					acc.circlet[stat] = (acc.circlet[stat] ?? 0) + 1;
				}
				return acc;
			},
			{ sands: {}, goblet: {}, circlet: {} },
		),
		subStats: pipe(
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
			take(3),
		),
	};
}
