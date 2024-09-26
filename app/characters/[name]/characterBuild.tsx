import { artifactSetsInfo } from '@/api/artifacts';
import { weaponsInfo } from '@/api/weapons';
import PageSection from '@/components/page/section';
import StatChipArray from '@/components/statChipArray';
import makeArray from '@/src/helpers/makeArray';
import type { Build } from '@/src/types/data';
import { AvatarGroup, Box, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import ArtifactSetImage from '../../artifacts/artifactSetImage';
import WeaponImage from '../../weapons/weaponImage';

export default function CharacterBuild({ build }: { build: Build }) {
	if (!build) return null;

	return (
		<PageSection title='Build'>
			<Stack spacing={1}>
				<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
					<Typography>Weapon</Typography>
					{build.weapon.map((weaponTier, index) => (
						<Box key={index}>
							<AvatarGroup sx={{ flexDirection: 'row-reverse' }} variant='rounded'>
								{makeArray(weaponTier)
									.toReversed()
									.map((weapon) => (
										<WeaponImage key={weapon} weapon={weaponsInfo[weapon]} size={50} />
									))}
							</AvatarGroup>
						</Box>
					))}
				</Stack>
				<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
					<Typography>Artifacts</Typography>
					{build.artifact.map((artifactTier, index) => (
						<Box key={index}>
							<AvatarGroup sx={{ flexDirection: 'row-reverse' }} variant='rounded'>
								{makeArray(artifactTier)
									.toReversed()
									.map((artifact) => (
										<ArtifactSetImage
											key={artifact}
											artifactSet={artifactSetsInfo[artifact]}
											size={50}
											component={Link}
											// @ts-ignore
											href={`/artifacts?set=${artifact}`}
										/>
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
