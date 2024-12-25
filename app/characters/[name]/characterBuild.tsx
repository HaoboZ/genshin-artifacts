import { artifactSetsInfo } from '@/api/artifacts';
import PageSection from '@/components/page/section';
import StatChipArray from '@/components/statChipArray';
import makeArray from '@/src/helpers/makeArray';
import type { Build } from '@/src/types/data';
import { AvatarGroup, Stack, Typography } from '@mui/material';
import Link from 'next/link';
import ArtifactSetImage from '../../artifacts/artifactSetImage';
import CharacterWeaponTier from './characterWeaponTier';

export default function CharacterBuild({ build }: { build: Build }) {
	if (!build) return null;

	return (
		<PageSection title='Build'>
			<Stack spacing={1}>
				<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
					<Typography>Weapon</Typography>
					<CharacterWeaponTier build={build} />
				</Stack>
				<Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
					<Typography>Artifacts</Typography>
					{build.artifact.map((artifactTier, index) => (
						<AvatarGroup key={index} variant='rounded'>
							{makeArray(artifactTier).map((artifact) => (
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
