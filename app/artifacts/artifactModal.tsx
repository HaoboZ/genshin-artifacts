import ArtifactImage from '@/components/images/artifact';
import SubStatBar from '@/components/subStatBar';
import type { IArtifact } from '@/src/good';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import getArtifactTier from '@/src/helpers/getArtifactTier';
import strArrMatch from '@/src/helpers/strArrMatch';
import { useModal, useModalControls } from '@/src/providers/modal';
import ModalDialog from '@/src/providers/modal/dialog';
import { data } from '@/src/resources/data';
import { statName } from '@/src/resources/stats';
import { tier } from '@/src/resources/tier';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { Box, Button, ButtonGroup, Grid, Stack, Typography } from '@mui/material';
import { filter, orderBy } from 'lodash';
import ArtifactCharacterCard from './artifactCharacterCard';
import EditArtifactModal from './editArtifactModal';

export default function ArtifactModal({ artifact }: { artifact: IArtifact }) {
	const { showModal } = useModal();
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

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
		<ModalDialog title={data.artifacts[artifact.setKey].name}>
			<ButtonGroup variant='contained'>
				<Button
					onClick={() => {
						closeModal();
						showModal(EditArtifactModal, { props: { artifact } });
					}}>
					Edit
				</Button>
				<Button
					color='error'
					onClick={() => {
						if (!confirm('Delete this artifact?')) return;
						dispatch(goodActions.deleteArtifact(artifact));
						closeModal();
					}}>
					Delete
				</Button>
			</ButtonGroup>
			<Stack direction='row'>
				<ArtifactImage artifact={artifact} size={120} />
				<Box width='100%' ml={1}>
					<Typography>{statName[artifact.mainStatKey]}</Typography>
					{artifact.substats.map((substat) => (
						<SubStatBar key={substat.key} substat={substat} rarity={artifact.rarity} />
					))}
				</Box>
			</Stack>
			<Grid container spacing={1} mt={1}>
				{tiers.map(({ tier, rating, subStat }) => (
					<Grid key={tier.key} item xs={6} md={4}>
						<ArtifactCharacterCard
							artifact={artifact}
							tier={tier}
							rating={rating}
							subStat={subStat}
							sx={{ ':hover': { cursor: 'pointer' } }}
							onClick={() => {
								if (artifact.location === tier.key) {
									alert(`Already equipped on ${data.characters[tier.key].name}`);
									return;
								}
								if (!confirm(`Give this artifact to ${data.characters[tier.key].name}?`))
									return;
								dispatch(goodActions.giveArtifact([tier.key as any, artifact]));
								closeModal();
							}}
						/>
					</Grid>
				))}
			</Grid>
		</ModalDialog>
	);
}
