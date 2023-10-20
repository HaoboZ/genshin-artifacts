'use client';
import ArtifactImage from '@/components/images/artifact';
import CharacterImage from '@/components/images/character';
import Page from '@/components/page';
import { PageLinkComponent } from '@/components/page/link';
import PageSection from '@/components/page/section';
import strArrMatch from '@/src/helpers/strArrMatch';
import useParamState from '@/src/hooks/useParamState';
import { useModal } from '@/src/providers/modal';
import { data } from '@/src/resources/data';
import { artifactOrder } from '@/src/resources/stats';
import { tier } from '@/src/resources/tier';
import { useAppSelector } from '@/src/store/hooks';
import { Grid, Stack } from '@mui/material';
import { filter, orderBy } from 'lodash';
import ArtifactCard from './artifactCard';
import ArtifactFilter from './artifactFilter';
import ArtifactModal from './artifactModal';
import BestInSlot from './bestInSlot';

export default function Artifacts() {
	const { showModal } = useModal();

	const good = useAppSelector(({ good }) => good);

	const [artifactSet, setArtifactSet] = useParamState('set', '');

	return (
		<Page noSsr title='Artifacts'>
			<ArtifactFilter artifactSet={artifactSet} setArtifactSet={setArtifactSet} />
			<PageSection title='Best in Slot'>
				{artifactSet ? (
					<BestInSlot artifactSet={artifactSet as any} />
				) : (
					orderBy(data.artifacts, 'order', 'desc').map((artifact) => (
						<Stack key={artifact.key} direction='row'>
							<ArtifactImage
								artifactSet={artifact}
								type='flower'
								sx={{ 'mr': 1, ':hover': { cursor: 'pointer' } }}
								onClick={() => setArtifactSet(artifact.key)}
							/>
							{filter(tier, (character) =>
								strArrMatch(character.artifact[0], artifact.key),
							).map(({ key }) => (
								<CharacterImage
									key={key}
									character={data.characters[key]}
									component={PageLinkComponent}
									//@ts-ignore
									href={`characters/${key}`}
								/>
							))}
						</Stack>
					))
				)}
			</PageSection>
			{artifactSet && (
				<PageSection title={data.artifacts[artifactSet]?.name}>
					<Grid container spacing={1}>
						{orderBy(
							good.artifacts.filter(({ setKey }) => setKey === artifactSet),
							[({ slotKey }) => artifactOrder.indexOf(slotKey), 'level'],
							['asc', 'desc'],
						).map((artifact, index) => (
							<Grid key={index} item xs={6} sm={4} md={3}>
								<ArtifactCard
									artifact={artifact}
									sx={{ ':hover': { cursor: 'pointer' } }}
									onClick={() => showModal(ArtifactModal, { props: { artifact } })}
								/>
							</Grid>
						))}
					</Grid>
				</PageSection>
			)}
		</Page>
	);
}
