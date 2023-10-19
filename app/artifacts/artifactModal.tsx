import ArtifactImage from '@/components/images/artifact';
import CharacterImage from '@/components/images/character';
import PercentBar from '@/components/percentBar';
import SubStatBar from '@/components/subStatBar';
import type { IArtifact } from '@/src/good';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import getArtifactTier from '@/src/helpers/getArtifactTier';
import strArrMatch from '@/src/helpers/strArrMatch';
import ModalDialog from '@/src/providers/modal/dialog';
import { data } from '@/src/resources/data';
import { statName } from '@/src/resources/stats';
import { tier } from '@/src/resources/tier';
import { useAppSelector } from '@/src/store/hooks';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { filter, orderBy } from 'lodash';
import { Fragment } from 'react';

export default function ArtifactModal({ artifact }: { artifact: IArtifact }) {
	const artifacts = useAppSelector(({ good }) => good.artifacts);

	const characters = filter(
		tier,
		(character) =>
			arrDeepIndex(character.artifact, artifact.setKey) !== -1 &&
			strArrMatch(character.mainStat[artifact.slotKey], artifact.mainStatKey),
	);

	const tiers = orderBy(
		characters.map((tier) => {
			const { rating, subStat } = getArtifactTier(tier, artifact);
			return { tier, rating, subStat };
		}),
		['rating', 'subStat'],
		['desc', 'desc'],
	);

	return (
		<ModalDialog title={artifact.setKey}>
			<Stack direction='row'>
				<ArtifactImage artifact={artifact} size={120} />
				<Box width='100%' ml={1}>
					<Typography>{statName[artifact.mainStatKey]}</Typography>
					{artifact.substats.map((substat) => (
						<SubStatBar
							key={substat.key}
							showValue
							substat={substat}
							rarity={artifact.rarity}
						/>
					))}
				</Box>
			</Stack>
			<Grid container spacing={1} mt={1}>
				{tiers.map(({ tier, rating, subStat }) => {
					const currentArtifact = artifacts.find(
						({ location, slotKey }) => location === tier.key && slotKey === artifact.slotKey,
					);
					const currentArtifactTier = getArtifactTier(tier, currentArtifact);

					return (
						<Grid key={tier.key} item>
							<Stack width={200} position='relative' direction='row'>
								<CharacterImage character={data.characters[tier.key]} size={100} />
								{currentArtifact && (
									<Fragment>
										<ArtifactImage
											hideCharacter
											artifact={currentArtifact}
											position='absolute'
											border={1}
											borderColor='white'
											size={40}
											top={60}
											left={58}
										/>
										<Box width='100%' ml={1}>
											<Typography variant='body2'>
												{statName[currentArtifact.mainStatKey]}
											</Typography>
											{currentArtifact.substats.map((substat) => (
												<SubStatBar
													key={substat.key}
													showValue
													substat={substat}
													rarity={currentArtifact.rarity}
												/>
											))}
										</Box>
									</Fragment>
								)}
							</Stack>
							<Grid container>
								<Grid item xs={6}>
									New
									<PercentBar p={rating} />
									<PercentBar p={subStat} />
								</Grid>
								{currentArtifact && (
									<Grid item xs={6}>
										Old
										<PercentBar p={currentArtifactTier.rating} />
										<PercentBar p={currentArtifactTier.subStat} />
									</Grid>
								)}
							</Grid>
						</Grid>
					);
				})}
			</Grid>
		</ModalDialog>
	);
}
