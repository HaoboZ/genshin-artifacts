'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useClipboardImage from '@/src/hooks/useClipboardImage';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import type { ArtifactSetKey, SlotKey } from '@/src/types/good';
import AddArtifactModal from '../artifactForm/addArtifactModal';
import ArtifactSetFilter from '../artifactSetFilter';
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
		<PageContainer noSsr>
			<PageTitle>Artifacts</PageTitle>
			<ArtifactSetFilter artifactSet={params.artifactSet} />
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
		</PageContainer>
	);
}
