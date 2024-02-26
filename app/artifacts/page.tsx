'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useEventListener from '@/src/hooks/useEventListener';
import { useModal } from '@/src/providers/modal';
import AddArtifactModal from './artifactForm/addArtifactModal';
import ArtifactSetFilter from './artifactSetFilter';
import BestInSlotAll from './bestInSlotAll';

export default function Artifacts() {
	const { modalStates, showModal } = useModal();

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'paste',
		({ clipboardData }: ClipboardEvent) => {
			if (modalStates.length) return;
			const item = Array.from(clipboardData.items).find(({ type }) => /^image\//.test(type));
			if (!item) return;
			showModal(AddArtifactModal, {
				props: { setKey: 'GladiatorsFinale', file: item.getAsFile() },
			});
		},
	);

	return (
		<PageContainer noSsr>
			<PageTitle>Artifacts</PageTitle>
			<ArtifactSetFilter />
			<PageSection
				title='Best in Slot'
				actions={[
					{
						name: 'Paste or Add',
						onClick: () => {
							showModal(AddArtifactModal, { props: { setKey: 'GladiatorsFinale' } });
						},
					},
				]}>
				<BestInSlotAll />
			</PageSection>
		</PageContainer>
	);
}
