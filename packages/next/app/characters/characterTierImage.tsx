import { builds } from '@/api/builds';
import { charactersInfo } from '@/api/characters';
import { weightedStatRollPercent } from '@/api/stats';
import OverlayText from '@/components/overlayText';
import PercentBar, { combinePercents } from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import type { CharacterKey, IGOOD } from '@/src/types/good';
import { Fragment, useMemo } from 'react';
import CharacterImage from './characterImage';

export default function CharacterTierImage({
	good,
	characterKey,
}: {
	good: IGOOD;
	characterKey: CharacterKey;
}) {
	const build = builds[characterKey];
	const character = good.characters.find(({ key }) => key === characterKey);

	const percent = useMemo(() => {
		const weapon = good.weapons.find(({ location }) => location === characterKey);
		const buildIndex = arrDeepIndex(build.weapon, weapon?.key);
		const artifacts = good.artifacts.filter(({ location }) => location === characterKey);

		return combinePercents(
			{
				percent: weapon && buildIndex !== -1 ? 1 - buildIndex / build.weapon.length : 0,
				weight: 0.25,
			},
			...artifacts.map((artifact) => ({
				weight: 0.15,
				percent: weightedStatRollPercent(build, artifact),
			})),
		);
	}, [characterKey, good]);

	return (
		<Fragment>
			<CharacterImage
				character={charactersInfo[characterKey]}
				size={65}
				sx={{ border: character ? 0 : 1, borderColor: 'red' }}>
				{character && (
					<OverlayText right size={12}>
						{character.level}
					</OverlayText>
				)}
			</CharacterImage>
			<PercentBar p={percent} />
		</Fragment>
	);
}
