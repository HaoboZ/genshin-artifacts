'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import PercentBar from '@/components/percentBar';
import { useModal } from '@/src/providers/modal';
import { elementsInfo } from '@/src/resources/data';
import { tier } from '@/src/resources/tier';
import { useAppSelector } from '@/src/store/hooks';
import { Card, Grid, Stack, Typography } from '@mui/joy';
import { keyBy } from 'lodash';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ArtifactCard from '../../artifacts/artifactCard';
import { artifactSlotOrder } from '../../artifacts/artifactData';
import getArtifactTier from '../../artifacts/getArtifactTier';
import { weaponsInfo } from '../../weapons/weaponData';
import WeaponImage from '../../weapons/weaponImage';
import { charactersInfo } from '../characterData';
import CharacterImage from '../characterImage';
import CharacterArtifactModal from './characterArtifactModal';
import CharacterTier from './characterTier';

export default function Character({ params }: { params: { name: string } }) {
	const { showModal } = useModal();

	const character = charactersInfo[params.name];
	if (!character) notFound();

	const weapon = useAppSelector(({ good }) =>
		good.weapons.find(({ location }) => location === character.key),
	);
	const artifacts = useAppSelector(({ good }) => good.artifacts);
	const artifactsKey = keyBy(
		artifacts.filter(({ location }) => location === character.key),
		'slotKey',
	);
	const characterTier = tier[character.key];

	return (
		<PageContainer noSsr>
			<PageTitle>
				<Stack direction='row' spacing={1} alignItems='center'>
					<Typography>{character.name}</Typography>
					{character.element !== 'None' && (
						<Image
							alt={character.element}
							src={elementsInfo[character.element].image}
							width={30}
							height={30}
						/>
					)}
				</Stack>
			</PageTitle>
			<CharacterImage character={character} />
			<CharacterTier tier={characterTier} />
			<PageSection title='Equipped'>
				<Grid container spacing={1}>
					<Grid xs={6} sm={4}>
						<Card>
							<WeaponImage weapon={weaponsInfo[weapon?.key]} type={character.weaponType} />
						</Card>
					</Grid>
					{artifactSlotOrder.map((slot) => {
						const artifact = artifactsKey[slot];
						const { rating, rarity, mainStat, subStat } = getArtifactTier(
							characterTier,
							artifact,
						);

						return (
							<Grid key={slot} xs={6} sm={4}>
								<ArtifactCard
									hideCharacter
									artifact={artifact}
									slot={slot}
									sx={{ ':hover': { cursor: 'pointer' } }}
									onClick={() => {
										showModal(CharacterArtifactModal, {
											props: { tier: characterTier, slot, artifact },
										});
									}}>
									<Grid item xs={12}>
										<PercentBar p={+rarity}>Rarity: %p</PercentBar>
										<PercentBar p={+mainStat}>MainStat: %p</PercentBar>
										<PercentBar p={rating}>Artifact Set: %p</PercentBar>
										<PercentBar p={subStat}>SubStat: %p</PercentBar>
									</Grid>
								</ArtifactCard>
							</Grid>
						);
					})}
				</Grid>
			</PageSection>
		</PageContainer>
	);
}
