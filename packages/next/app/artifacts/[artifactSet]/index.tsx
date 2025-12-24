'use client';
import PageSection from '@/components/page/section';
import { useModal } from '@/src/providers/modal';
import dynamicModal from '@/src/providers/modal/dynamic';
import { type ArtifactSetKey } from '@/src/types/good';
import { Grid } from '@mui/material';
import { Fragment } from 'react';
import ArtifactList from './artifactList';
import BestInSlot from './bestInSlot';

const AddArtifactModal = dynamicModal(() => import('../artifactForm/addArtifactModal'));
const BatchAddArtifactModal = dynamicModal(() => import('../artifactForm/batchAddArtifactModal'));

export default function ArtifactSet({ artifactSet }: { artifactSet: ArtifactSetKey }) {
	const { showModal } = useModal();

	return (
		<Fragment>
			<PageSection
				title='Best in Slot'
				actions={[
					{
						name: 'Add',
						onClick: () => showModal(AddArtifactModal),
					},
					{
						name: 'Batch Add',
						onClick: () => showModal(BatchAddArtifactModal),
					},
				]}>
				<Grid container spacing={1}>
					<Grid size={6}>
						<BestInSlot group={0} artifactSet={artifactSet} />
					</Grid>
					<Grid size={6}>
						<BestInSlot group={1} artifactSet={artifactSet} />
					</Grid>
				</Grid>
			</PageSection>
			<ArtifactList artifactSet={artifactSet} />
		</Fragment>
	);
}
