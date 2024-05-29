import { artifactSetsInfo } from '@/api/artifacts';
import { weaponsInfo } from '@/api/weapons';
import PageSection from '@/components/page/section';
import StatChipArray from '@/components/statChipArray';
import makeArray from '@/src/helpers/makeArray';
import type { Build } from '@/src/types/data';
import { Avatar, AvatarGroup, Box, Stack, Typography } from '@mui/joy';
import Link from 'next/link';
import ArtifactSetImage from '../../artifacts/artifactSetImage';
import WeaponImage from '../../weapons/weaponImage';

export default function CharacterBuild({ build }: { build: Build }) {
	if (!build) return null;

	return (
		<PageSection title='Build'>
			<Stack spacing={1}>
				<Stack direction='row' spacing={1} alignItems='center'>
					<Typography>Weapon</Typography>
					{build.weapon.map((weaponTier, index) => (
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
					{build.artifact.map((artifactTier, index) => (
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
				<StatChipArray mapStats name='Sands' arr={makeArray(build.mainStat.sands)} />
				<StatChipArray mapStats name='Goblet' arr={makeArray(build.mainStat.goblet)} />
				<StatChipArray mapStats name='Circlet' arr={makeArray(build.mainStat.circlet)} />
				<StatChipArray mapStats breadcrumbs name='SubStats' arr={build.subStat} />
			</Stack>
		</PageSection>
	);
}
