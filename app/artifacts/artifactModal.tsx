import SubStatBar from '@/components/subStatBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import pget from '@/src/helpers/pget';
import strArrMatch from '@/src/helpers/strArrMatch';
import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { IArtifact } from '@/src/types/good';
import {
	DialogTitle,
	FormControl,
	FormLabel,
	Grid,
	ModalClose,
	ModalDialog,
	Switch,
	Typography,
} from '@mui/joy';
import { useMemo, useState } from 'react';
import { map, pipe, reverse, sortBy } from 'remeda';
import { charactersInfo, charactersTier } from '../characters/characterData';
import CharacterImage from '../characters/characterImage';
import ArtifactActions from './artifactActions';
import ArtifactCharacterCard from './artifactCharacterCard';
import { artifactSetsInfo, statName } from './artifactData';
import ArtifactImage from './artifactImage';
import getArtifactTier from './getArtifactTier';

export default function ArtifactModal({ artifact }: { artifact: IArtifact }, ref) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const [checked, setChecked] = useState(false);

	const charactersTiered = useMemo(() => {
		const characters = Object.values(charactersTier).filter(
			(tier) =>
				(checked
					? arrDeepIndex(tier.artifact, artifact.setKey) !== -1
					: makeArray(tier.artifact[0])[0] === artifact.setKey) &&
				strArrMatch(tier.mainStat[artifact.slotKey], artifact.mainStatKey),
		);

		return pipe(
			characters,
			map((tier) => {
				const { rating, subStat } = getArtifactTier(tier, artifact);
				return { tier, rating, subStat };
			}),
			sortBy(pget('subStat')),
			sortBy(pget('rating')),
			reverse(),
		);
	}, [artifact, checked]);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>{artifactSetsInfo[artifact.setKey].name}</DialogTitle>
			<ModalClose variant='outlined' />
			<ArtifactActions artifact={artifact} />
			<Grid container spacing={1}>
				<Grid xs='auto'>
					<ArtifactImage artifact={artifact}>
						{artifact.location && (
							<CharacterImage
								character={charactersInfo[artifact.location]}
								size={50}
								position='absolute'
								bottom={0}
								right={0}
								border={1}
							/>
						)}
					</ArtifactImage>
				</Grid>
				<Grid xs>
					<Typography>{statName[artifact.mainStatKey]}</Typography>
					{artifact.substats.map((substat) => (
						<SubStatBar key={substat.key} substat={substat} rarity={artifact.rarity} />
					))}
				</Grid>
			</Grid>
			<FormControl orientation='horizontal'>
				<FormLabel>All Tiered Sets</FormLabel>
				<Switch
					size='lg'
					sx={{ ml: 0 }}
					checked={checked}
					onChange={({ target }) => setChecked(target.checked)}
				/>
			</FormControl>
			<Grid container spacing={1} sx={{ overflowY: 'scroll' }}>
				{charactersTiered.map(({ tier, rating, subStat }) => (
					<Grid key={tier.key} xs={6} md={4}>
						<ArtifactCharacterCard
							artifact={artifact}
							tier={tier}
							rating={rating}
							subStat={subStat}
							sx={{ ':hover': { cursor: 'pointer' } }}
							onClick={() => {
								if (artifact.location === tier.key) {
									alert(`Already equipped on ${charactersInfo[tier.key].name}`);
									return;
								}
								if (!confirm(`Give this artifact to ${charactersInfo[tier.key].name}?`))
									return;
								dispatch(goodActions.giveArtifact([tier.key, artifact]));
								closeModal();
							}}
						/>
					</Grid>
				))}
			</Grid>
		</ModalDialog>
	);
}
