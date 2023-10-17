import ArtifactImage from '@/components/images/artifact';
import PercentBar from '@/components/percentBar';
import data from '@/public/data.json';
import type { DArtifact, Tier } from '@/src/data';
import type { IArtifact } from '@/src/good';
import { Fragment } from 'react';
import { getWeightedTier, rarityWeight, stats } from '../stats';

export default function ArtifactCard({
	type,
	artifact,
	tier,
}: {
	type: 'flower' | 'plume' | 'sands' | 'goblet' | 'circlet';
	artifact: IArtifact;
	tier: Tier;
}) {
	const artifactData = data.artifacts[artifact?.setKey] as DArtifact;
	const mainStat =
		type === 'flower' || type === 'plume'
			? Boolean(artifact)
			: typeof tier?.mainStat[type] === 'string'
			? tier?.mainStat[type] === artifact?.mainStatKey
			: tier?.mainStat[type].indexOf(artifact?.mainStatKey) !== -1;
	const weightedVal = artifact?.substats?.reduce(
		(current, { key, value }) =>
			current + (getWeightedTier(tier.subStat, key) * value) / stats[key]?.[artifact?.rarity],
		0,
	);

	return (
		<Fragment>
			<ArtifactImage artifact={artifactData} type={type} />
			<PercentBar
				vals={[
					{
						reverse: true,
						weight: 4 / 12,
						max: tier?.artifact.length,
						current: tier?.artifact.indexOf(artifact?.setKey),
					},
					{
						weight: 4 / 12,
						max: 2 - (artifact?.rarity === artifactData?.rarity),
						current: +mainStat,
					},
					{
						weight: 4 / 12,
						max: rarityWeight[artifact?.rarity],
						current: weightedVal,
					},
				]}
			/>
		</Fragment>
	);
}
