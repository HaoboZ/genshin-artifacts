import { missingArtifactSets } from '@/api/artifacts';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import type { Build } from '@/src/types/data';
import type { ArtifactSetKey, StatKey } from '@/src/types/good';
import { groupBy, map, pipe, reduce, take } from 'remeda';

export default function getArtifactSetBuild(
	characterBuilds: Build[],
	artifactSet: ArtifactSetKey,
	group?: number,
): Build {
	const filteredBuilds = characterBuilds.filter(
		({ artifact }) => makeArray(artifact[0])[0] === artifactSet,
	);

	const builds = filteredBuilds.length
		? filteredBuilds
		: group
			? []
			: [missingArtifactSets[artifactSet]].filter(Boolean);

	return {
		key: 'Traveler',
		role: 'DPS',
		weapon: ['DullBlade'],
		group: 0,
		artifact: [artifactSet],
		mainStat: builds.reduce(
			(acc, { mainStat }) => {
				const sandStat = makeArray(mainStat.sands)[0];
				acc.sands[0].push(sandStat);
				const gobletStat = makeArray(mainStat.goblet)[0];
				acc.goblet[0].push(gobletStat);
				const circletStat = makeArray(mainStat.circlet)[0];
				acc.circlet[0].push(circletStat);
				return acc;
			},
			{ sands: [[]], goblet: [[]], circlet: [[]] },
		) as any,
		subStat: pipe(
			builds,
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
			take(4),
		) as any,
	};
}
