'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useClipboardImage from '@/src/hooks/useClipboardImage';
import { useModal } from '@/src/providers/modal';
import AddArtifactModal from './artifactForm/addArtifactModal';
import ArtifactSetFilter from './artifactSetFilter';
import BestInSlotAll from './bestInSlotAll';

export default function Artifacts() {
	const { modalStates, showModal } = useModal();

	useClipboardImage((items) => {
		if (modalStates.length) return;
		showModal(AddArtifactModal, {
			props: { setKey: 'GladiatorsFinale', file: items[0].getAsFile() },
		});
	});

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
