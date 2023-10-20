import ArtifactImage from '@/components/images/artifact';
import WeaponImage from '@/components/images/weapon';
import PageSection from '@/components/page/section';
import StatChips from '@/components/statChips';
import type { Tier } from '@/src/data';
import makeArray from '@/src/helpers/makeArray';
import { data } from '@/src/resources/data';
import { AvatarGroup, Stack, Typography } from '@mui/material';
import { flatten } from 'lodash';

export default function CharacterTier({ tier }: { tier: Tier }) {
	return (
		<PageSection title='Tier'>
			<Stack spacing={1}>
				<Stack direction='row' spacing={1} alignItems='center'>
					<Typography>Weapon</Typography>
					{tier.weapon.map((weaponTier, index) => (
						<AvatarGroup key={index} variant='rounded' spacing='small'>
							{makeArray(weaponTier).map((weapon) => (
								<WeaponImage key={weapon} weapon={data.weapons[weapon]} />
							))}
						</AvatarGroup>
					))}
				</Stack>
				<Stack direction='row' spacing={1} alignItems='center'>
					<Typography>Artifacts</Typography>
					{tier.artifact.map((artifactTier, index) => (
						<AvatarGroup key={index} variant='rounded' spacing='small'>
							{makeArray(artifactTier).map((artifact) => (
								<ArtifactImage
									key={artifact}
									artifactSet={data.artifacts[artifact]}
									type='flower'
								/>
							))}
						</AvatarGroup>
					))}
				</Stack>
				<StatChips name='Sands' statArr={tier.mainStat.sands} />
				<StatChips name='Goblet' statArr={tier.mainStat.goblet} />
				<StatChips name='Circlet' statArr={tier.mainStat.circlet} />
				<StatChips name='SubStats' statArr={flatten(tier.subStat)} />
			</Stack>
		</PageSection>
	);
}
