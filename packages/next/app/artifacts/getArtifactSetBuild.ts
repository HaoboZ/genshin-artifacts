import getFirst from '@/helpers/getFirst';
import makeArray from '@/helpers/makeArray';
import { type Build } from '@/types/data';
import { type ArtifactSetKey, type StatKey } from '@/types/good';
import { groupBy, map, pipe, prop, reduce, take } from 'remeda';

export default function getArtifactSetBuild(
	characterBuilds: Build[],
	artifactSet: ArtifactSetKey,
): Build {
	const filteredBuilds = characterBuilds.filter(
		({ artifact }) => getFirst(artifact) === artifactSet,
	);

	return {
		key: 'Traveler',
		role: 'DPS',
		weapon: [],
		group: 0,
		artifact: [artifactSet],
		mainStat: filteredBuilds.reduce(
			(acc, { mainStat }) => {
				const sandStat = getFirst(mainStat.sands);
				acc.sands[0].push(sandStat);
				const gobletStat = getFirst(mainStat.goblet);
				acc.goblet[0].push(gobletStat);
				const circletStat = getFirst(mainStat.circlet);
				acc.circlet[0].push(circletStat);
				return acc;
			},
			{ sands: [[]], goblet: [[]], circlet: [[]] },
		) as any,
		subStat: pipe(
			filteredBuilds,
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
			groupBy(prop(1)),
			Object.values<[string, number][]>,
			map((stat) => stat.flatMap(prop(0))),
			take(4),
		) as any,
	};
}
