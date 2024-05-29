'use client';
import PageSection from '@/components/page/section';
import useClipboardImage from '@/src/hooks/useClipboardImage';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import type { ArtifactSetKey, SlotKey } from '@/src/types/good';
import { Fragment } from 'react';
import AddArtifactModal from '../artifactForm/addArtifactModal';
import ArtifactList from './artifactList';
import BestInSlot from './bestInSlot';
import SlotFilter from './slotFilter';

export default function ArtifactSet({ params }: { params: { artifactSet: ArtifactSetKey } }) {
	const { modalStates, showModal } = useModal();

	const [slot, setSlot] = useParamState<SlotKey>('slot', null);

	useClipboardImage((items) => {
		if (modalStates.length) return;
		showModal(AddArtifactModal, {
			props: { setKey: params.artifactSet, file: items[0].getAsFile() },
		});
	});

	return (
		<Fragment>
			<SlotFilter slot={slot} setSlot={setSlot} />
			<PageSection
				title='Best in Slot'
				actions={[
					{
						name: 'Paste or Add',
						onClick: () => {
							showModal(AddArtifactModal, { props: { setKey: params.artifactSet } });
						},
					},
				]}>
				<BestInSlot artifactSet={params.artifactSet} slot={slot} />
			</PageSection>
			<ArtifactList artifactSet={params.artifactSet} slot={slot} />
		</Fragment>
	);
}
