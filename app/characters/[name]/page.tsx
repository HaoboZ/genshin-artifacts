'use client';
import CharacterImage from '@/components/images/character';
import WeaponImage from '@/components/images/weapon';
import Page from '@/components/page';
import PageSection from '@/components/page/section';
import PercentBar from '@/components/percentBar';
import getArtifactTier from '@/src/helpers/getArtifactTier';
import { useModal } from '@/src/providers/modal';
import { data } from '@/src/resources/data';
import { artifactOrder } from '@/src/resources/stats';
import { tier } from '@/src/resources/tier';
import { useAppSelector } from '@/src/store/hooks';
import { Grid, Paper, Stack } from '@mui/material';
import { keyBy } from 'lodash';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ArtifactCard from '../../artifacts/artifactCard';
import CharacterArtifactModal from './characterArtifactModal';
import CharacterTier from './tier';

export default function Character({ params }: { params: { name: string } }) {
	const { showModal } = useModal();

	const character = data.characters[params.name];
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
		<Page
			noSsr
			title={
				<Stack direction='row' spacing={1}>
					{character.name}
					<Image
						alt={character.element}
						src={data.elements[character.element]?.image}
						width={30}
						height={30}
					/>
				</Stack>
			}>
			<CharacterImage character={character} size={100} />
			<CharacterTier tier={characterTier} />
			<PageSection title='Equipped'>
				<Grid container spacing={1}>
					<Grid item xs={6} sm={4}>
						<Paper sx={{ display: 'flex', p: 1 }}>
							<WeaponImage
								weapon={data.weapons[weapon?.key]}
								type={character.weaponType as any}
								size={100}
							/>
						</Paper>
					</Grid>
					{artifactOrder.map((slot) => {
						const artifact = artifactsKey[slot];
						const { rating, rarity, mainStat, subStat } = getArtifactTier(
							characterTier,
							artifact,
						);

						return (
							<Grid key={slot} item xs={6} sm={4}>
								<ArtifactCard
									hideCharacter
									artifact={artifact}
									type={slot as any}
									sx={{ ':hover': { cursor: 'pointer' } }}
									onClick={() =>
										showModal(CharacterArtifactModal, {
											props: { tier: characterTier, type: slot, artifact },
										})
									}>
									<PercentBar p={+rarity}>Rarity: %p</PercentBar>
									<PercentBar p={+mainStat}>MainStat: %p</PercentBar>
									<PercentBar p={rating}>Artifact Set: %p</PercentBar>
									<PercentBar p={subStat}>SubStat: %p</PercentBar>
								</ArtifactCard>
							</Grid>
						);
					})}
				</Grid>
			</PageSection>
		</Page>
	);
}
