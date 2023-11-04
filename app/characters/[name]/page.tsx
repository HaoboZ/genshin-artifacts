'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import useEventListener from '@/src/hooks/useEventListener';
import { useModal } from '@/src/providers/modal';
import { useAppSelector } from '@/src/store/hooks';
import { Card, Grid, Stack, Typography } from '@mui/joy';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { useMemo } from 'react';
import { indexBy } from 'remeda';
import ArtifactCard from '../../artifacts/artifactCard';
import { artifactSlotOrder } from '../../artifacts/artifactData';
import AddArtifactModal from '../../artifacts/artifactForm/addArtifactModal';
import getArtifactTier from '../../artifacts/getArtifactTier';
import { weaponsInfo } from '../../weapons/weaponData';
import WeaponImage from '../../weapons/weaponImage';
import { charactersInfo, charactersTier, elementsInfo } from '../characterData';
import CharacterImage from '../characterImage';
import CharacterArtifactModal from './characterArtifactModal';
import CharacterTier from './characterTier';
import CharacterWeaponModal from './characterWeaponModal';
import QuadBars from './quadBars';

export default function Character({ params }: { params: { name: string } }) {
	const { modalStates, showModal } = useModal();

	const character = charactersInfo[params.name];
	if (!character) notFound();

	const weapon = useAppSelector(({ good }) =>
		good.weapons.find(({ location }) => location === character.key),
	);
	const artifacts = useAppSelector(pget('good.artifacts'));

	const artifactsKey = indexBy(
		artifacts.filter(({ location }) => location === character.key),
		pget('slotKey'),
	);

	const characterTier = charactersTier[character.key];
	const weaponTier = useMemo(() => {
		if (!weapon) return 0;
		const index = arrDeepIndex(characterTier.weapon, weapon.key);
		return index !== -1 ? 1 - index / characterTier.weapon.length : 0;
	}, [characterTier, weapon]);

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'paste',
		({ clipboardData }: ClipboardEvent) => {
			if (modalStates.length) return;
			const item = Array.from(clipboardData.items).find(({ type }) => /^image\//.test(type));
			if (!item) return;
			showModal(AddArtifactModal, {
				props: {
					setKey: makeArray(characterTier.artifact[0])[0],
					file: item.getAsFile(),
					character,
				},
			});
		},
	);

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
			<PageSection
				title='Equipped'
				actions={[
					{
						name: 'Paste or Add',
						onClick: () => {
							showModal(AddArtifactModal, {
								props: { setKey: makeArray(characterTier.artifact[0])[0], character },
							});
						},
					},
				]}>
				<Grid container spacing={1}>
					<Grid xs={6} sm={4}>
						<Card
							sx={{ ':hover': { cursor: 'pointer' } }}
							onClick={() => {
								showModal(CharacterWeaponModal, { props: { tier: characterTier, weapon } });
							}}>
							<WeaponImage weapon={weaponsInfo[weapon?.key]} type={character.weaponType} />
							{weapon && <PercentBar p={weaponTier} />}
						</Card>
					</Grid>
					{artifactSlotOrder.map((slot) => {
						const artifact = artifactsKey[slot];
						const artifactTier = getArtifactTier(characterTier, artifact);

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
									<QuadBars artifactTier={artifactTier} />
								</ArtifactCard>
							</Grid>
						);
					})}
				</Grid>
			</PageSection>
		</PageContainer>
	);
}
