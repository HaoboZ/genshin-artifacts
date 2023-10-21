import ChipArray from '@/components/chipArray';
import PageSection from '@/components/page/section';
import makeArray from '@/src/helpers/makeArray';
import { data } from '@/src/resources/data';
import type { Tier } from '@/src/types/data';
import { AvatarGroup, Stack, Typography } from '@mui/joy';
import { flatten } from 'lodash';
import ArtifactImage from '../../artifacts/artifactImage';
import WeaponImage from '../../weapons/weaponImage';

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
				<ChipArray name='Sands' arr={tier.mainStat.sands} />
				<ChipArray name='Goblet' arr={tier.mainStat.goblet} />
				<ChipArray name='Circlet' arr={tier.mainStat.circlet} />
				<ChipArray name='SubStats' arr={flatten(tier.subStat)} />
			</Stack>
		</PageSection>
	);
}
