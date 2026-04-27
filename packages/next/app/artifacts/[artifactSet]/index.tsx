'use client';

import PageSection from '@/components/page/pageSection';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { type ArtifactSetKey } from '@/types/good';
import { Grid } from '@mui/material';
import { Fragment } from 'react';
import ArtifactList from './artifactList';
import BestInSlot from './bestInSlot';

const AddArtifactModal = dynamicModal(() => import('../modals/addArtifactModal'));
const BatchAddArtifactModal = dynamicModal(() => import('../modals/batchAddArtifactModal'));

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
					{[0, 1, 2].map((i) => (
						<BestInSlot key={i} group={i} artifactSet={artifactSet} />
					))}
				</Grid>
			</PageSection>
			<ArtifactList artifactSet={artifactSet} />
		</Fragment>
	);
}
