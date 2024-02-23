'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useEventListener from '../../../src/hooks/useEventListener';
import useParamState from '../../../src/hooks/useParamState';
import { useModal } from '../../../src/providers/modal';
import type { ArtifactSetKey, SlotKey } from '../../../src/types/good';
import AddArtifactModal from '../artifactForm/addArtifactModal';
import ArtifactSetFilter from '../artifactSetFilter';
import ArtifactList from './artifactList';
import BestInSlot from './bestInSlot';
import SlotFilter from './slotFilter';

export default function ArtifactSet({ params }: { params: { artifactSet: ArtifactSetKey } }) {
	const { modalStates, showModal } = useModal();

	const [slot, setSlot] = useParamState<SlotKey>('slot', null);

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'paste',
		({ clipboardData }: ClipboardEvent) => {
			if (modalStates.length) return;
			const item = Array.from(clipboardData.items).find(({ type }) => /^image\//.test(type));
			if (!item) return;
			showModal(AddArtifactModal, {
				props: { setKey: params.artifactSet, file: item.getAsFile() },
			});
		},
	);

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
