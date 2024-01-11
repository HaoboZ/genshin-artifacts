import PageSection from '@/components/page/section';
import StatChipArray from '@/components/statChipArray';
import makeArray from '@/src/helpers/makeArray';
import type { Tier } from '@/src/types/data';
import { Avatar, AvatarGroup, Box, Stack, Typography } from '@mui/joy';
import Link from 'next/link';
import { artifactSetsInfo } from '../../artifacts/artifactData';
import ArtifactSetImage from '../../artifacts/artifactSetImage';
import { weaponsInfo } from '../../weapons/weaponData';
import WeaponImage from '../../weapons/weaponImage';

export default function CharacterTier({ tier }: { tier: Tier }) {
	if (!tier) return null;

	return (
		<PageSection title='Tier'>
			<Stack spacing={1}>
				<Stack direction='row' spacing={1} alignItems='center'>
					<Typography>Weapon</Typography>
					{tier.weapon.map((weaponTier, index) => (
						<Box key={index}>
							<AvatarGroup sx={{ flexDirection: 'row-reverse' }}>
								{makeArray(weaponTier)
									.toReversed()
									.map((weapon) => (
										<Avatar key={weapon} sx={{ '--Avatar-size': 50, 'borderRadius': 5 }}>
											<WeaponImage weapon={weaponsInfo[weapon]} size={50} />
										</Avatar>
									))}
							</AvatarGroup>
						</Box>
					))}
				</Stack>
				<Stack direction='row' spacing={1} alignItems='center'>
					<Typography>Artifacts</Typography>
					{tier.artifact.map((artifactTier, index) => (
						<Box key={index}>
							<AvatarGroup sx={{ flexDirection: 'row-reverse' }}>
								{makeArray(artifactTier)
									.toReversed()
									.map((artifact) => (
										<Avatar
											key={artifact}
											sx={{ '--Avatar-size': 50, 'borderRadius': 5 }}
											component={Link}
											href={`/artifacts?set=${artifact}`}>
											<ArtifactSetImage
												artifactSet={artifactSetsInfo[artifact]}
												size={50}
											/>
										</Avatar>
									))}
							</AvatarGroup>
						</Box>
					))}
				</Stack>
				<StatChipArray mapStats name='Sands' arr={makeArray(tier.mainStat.sands)} />
				<StatChipArray mapStats name='Goblet' arr={makeArray(tier.mainStat.goblet)} />
				<StatChipArray mapStats name='Circlet' arr={makeArray(tier.mainStat.circlet)} />
				<StatChipArray mapStats breadcrumbs name='SubStats' arr={tier.subStat} />
			</Stack>
		</PageSection>
	);
}
