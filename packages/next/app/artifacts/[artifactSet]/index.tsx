'use client';
import PageSection from '@/components/page/section';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import type { ArtifactSetKey, SlotKey } from '@/src/types/good';
import { Grid } from '@mui/material';
import { Fragment } from 'react';
import AddArtifactModal from '../artifactForm/addArtifactModal';
import BatchAddArtifactModal from '../artifactForm/batchAddArtifactModal';
import ArtifactList from './artifactList';
import BestInSlot from './bestInSlot';
import SlotFilter from './slotFilter';

export default function ArtifactSet({ artifactSet }: { artifactSet: ArtifactSetKey }) {
	const { showModal } = useModal();

	const [slot, setSlot] = useParamState<SlotKey>('slot', null);

	return (
		<Fragment>
			<SlotFilter slot={slot} setSlot={setSlot} />
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
						<BestInSlot group={0} artifactSet={artifactSet} slot={slot} />
					</Grid>
					<Grid size={6}>
						<BestInSlot group={1} artifactSet={artifactSet} slot={slot} />
					</Grid>
				</Grid>
			</PageSection>
			<ArtifactList artifactSet={artifactSet} slot={slot} />
		</Fragment>
	);
}
