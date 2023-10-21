import PercentBar from '@/components/percentBar';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import makeArray from '@/src/helpers/makeArray';
import { useModalControls } from '@/src/providers/modal';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { Tier } from '@/src/types/data';
import type { IArtifact, SlotKey } from '@/src/types/good';
import { DialogTitle, Grid, ModalDialog } from '@mui/joy';
import { capitalize, orderBy } from 'lodash';
import ArtifactCard from '../../artifacts/artifactCard';
import getArtifactTier from '../../artifacts/getArtifactTier';
import { charactersInfo } from '../characterData';

export default function CharacterArtifactModal(
	{
		tier,
		slot,
		artifact,
	}: {
		tier: Tier;
		slot: SlotKey;
		artifact: IArtifact;
	},
	ref,
) {
	const artifacts = useAppSelector(({ good }) => good.artifacts);
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const mainStat = tier.mainStat[slot] && makeArray(tier.mainStat[slot]);
	const artifactsFiltered = artifacts
		.filter(
			({ slotKey, setKey, mainStatKey }) =>
				slotKey === slot &&
				(mainStat ? mainStat.includes(mainStatKey) : true) &&
				arrDeepIndex(tier.artifact, setKey) !== -1,
		)
		.map((artifact) => ({ artifact, artifactTier: getArtifactTier(tier, artifact) }));
	const artifactsSorted = orderBy(
		artifactsFiltered,
		['artifactTier.rating', 'artifactTier.subStat'],
		['desc', 'desc'],
	);
	const artifactTier = getArtifactTier(tier, artifact);

	return (
		<ModalDialog ref={ref} minWidth='md'>
			<DialogTitle>
				{capitalize(slot)} for ${charactersInfo[tier.key].name}
			</DialogTitle>
			{artifact && (
				<ArtifactCard hideCharacter artifact={artifact}>
					<PercentBar p={artifactTier.rating}>Artifact Set: %p</PercentBar>
					<PercentBar p={artifactTier.subStat}>SubStat: %p</PercentBar>
				</ArtifactCard>
			)}
			<Grid container spacing={1} sx={{ overflowY: 'scroll' }}>
				{artifactsSorted.map(({ artifact, artifactTier }, index) => (
					<Grid key={index} xs={6} md={4}>
						<ArtifactCard
							artifact={artifact}
							sx={{ ':hover': { cursor: 'pointer' } }}
							onClick={() => {
								if (!confirm(`Give this artifact to ${charactersInfo[tier.key].name}?`))
									return;
								dispatch(goodActions.giveArtifact([tier.key, artifact]));
								closeModal();
							}}>
							<PercentBar p={artifactTier.rating}>Artifact Set: %p</PercentBar>
							<PercentBar p={artifactTier.subStat}>SubStat: %p</PercentBar>
						</ArtifactCard>
					</Grid>
				))}
			</Grid>
		</ModalDialog>
	);
}
