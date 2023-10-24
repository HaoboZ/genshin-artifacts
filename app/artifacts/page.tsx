'use client';
import PageContainer from '@/components/page/container';
import PageSection from '@/components/page/section';
import PageTitle from '@/components/page/title';
import useEventListener from '@/src/hooks/useEventListener';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import type { ArtifactSetKey } from '@/src/types/good';
import AddArtifactModal from './artifactForm/addArtifactModal';
import ArtifactList from './artifactList';
import ArtifactSetFilter from './artifactSetFilter';
import BestInSlot from './bestInSlot';
import BestInSlotAll from './bestInSlotAll';

export default function Artifacts() {
	const { showModal } = useModal();

	const [artifactSet, setArtifactSet] = useParamState<ArtifactSetKey>('set', null);

	useEventListener(
		typeof window !== 'undefined' ? window : null,
		'paste',
		({ clipboardData }: ClipboardEvent) => {
			const item = Array.from(clipboardData.items).find(({ type }) => /^image\//.test(type));
			if (!item) return;
			showModal(AddArtifactModal, {
				props: { setKey: artifactSet || 'GladiatorsFinale', file: item.getAsFile() },
			});
		},
	);

	return (
		<PageContainer noSsr>
			<PageTitle>Artifacts</PageTitle>
			<ArtifactSetFilter artifactSet={artifactSet} setArtifactSet={setArtifactSet} />
			<PageSection
				title='Best in Slot'
				actions={[
					{
						name: 'Paste or Add',
						onClick: () =>
							showModal(AddArtifactModal, {
								props: { setKey: artifactSet || 'GladiatorsFinale' },
							}),
					},
				]}>
				{artifactSet ? (
					<BestInSlot artifactSet={artifactSet} />
				) : (
					<BestInSlotAll setArtifactSet={setArtifactSet} />
				)}
			</PageSection>
			{artifactSet && <ArtifactList artifactSet={artifactSet} />}
		</PageContainer>
	);
}
