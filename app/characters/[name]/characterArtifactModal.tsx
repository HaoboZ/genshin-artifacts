import PercentBar from '@/components/percentBar';
import type { Tier } from '@/src/data';
import type { IArtifact, SlotKey } from '@/src/good';
import arrDeepIndex from '@/src/helpers/arrDeepIndex';
import getArtifactTier from '@/src/helpers/getArtifactTier';
import makeArray from '@/src/helpers/makeArray';
import { useModalControls } from '@/src/providers/modal';
import ModalDialog from '@/src/providers/modal/dialog';
import { data } from '@/src/resources/data';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import { Grid } from '@mui/material';
import { capitalize, orderBy } from 'lodash';
import ArtifactCard from '../../artifacts/artifactCard';

export default function CharacterArtifactModal({
	tier,
	type,
	artifact,
}: {
	tier: Tier;
	type: SlotKey;
	artifact: IArtifact;
}) {
	const artifacts = useAppSelector(({ good }) => good.artifacts);
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();

	const mainStat = tier.mainStat[type] && makeArray(tier.mainStat[type]);
	const artifactsFiltered = artifacts
		.filter(
			({ slotKey, setKey, mainStatKey }) =>
				slotKey === type &&
				(mainStat ? mainStat.includes(mainStatKey) : true) &&
				arrDeepIndex(tier.artifact, setKey) !== -1,
		)
		.map((artifact) => ({ artifact, artifactTier: getArtifactTier(tier, artifact) }));
	const artifactsSorted = orderBy(
		artifactsFiltered,
		['tier.rating', 'tier.subStat'],
		['desc', 'desc'],
	);
	const artifactTier = getArtifactTier(tier, artifact);

	return (
		<ModalDialog title={`${capitalize(type)} for ${data.characters[tier.key].name}`}>
			{artifact && (
				<ArtifactCard hideCharacter artifact={artifact}>
					<PercentBar p={artifactTier.rating}>Artifact Set: %p</PercentBar>
					<PercentBar p={artifactTier.subStat}>SubStat: %p</PercentBar>
				</ArtifactCard>
			)}
			<Grid container spacing={1}>
				{artifactsSorted.map(({ artifact, artifactTier }, index) => (
					<Grid key={index} item xs={6} md={4}>
						<ArtifactCard
							artifact={artifact}
							sx={{ ':hover': { cursor: 'pointer' } }}
							onClick={() => {
								if (!confirm(`Give this artifact to ${data.characters[tier.key].name}?`))
									return;
								dispatch(goodActions.giveArtifact([tier.key as any, artifact]));
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
