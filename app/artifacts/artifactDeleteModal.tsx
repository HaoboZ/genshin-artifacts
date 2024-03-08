import pget from '@/src/helpers/pget';
import { useModalControls } from '@/src/providers/modal';
import ModalWrapper from '@/src/providers/modal/dialog';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemContent,
	ModalClose,
	ModalDialog,
	Typography,
} from '@mui/joy';
import { useMemo, useState } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import ArtifactCard from './artifactCard';
import useArtifactsTiered from './useArtifactsTiered';

export default function ArtifactDeleteModal() {
	const { closeModal } = useModalControls();
	const dispatch = useAppDispatch();
	const artifacts = useAppSelector(pget('good.artifacts'));

	const artifactsFiltered = useMemo(
		() => artifacts.filter(({ lock, location }) => lock && !location),
		[artifacts],
	);
	const artifactsTiered = useArtifactsTiered(artifactsFiltered);
	const [deleteArtifacts, setDeleteArtifacts] = useState(() =>
		pipe(
			artifactsTiered,
			filter(({ tier }) => tier.potential < 0.5),
			sortBy(({ tier }) => tier.potential),
			map((artifact) => ({ artifact, selected: true })),
		),
	);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>Upgrade Artifact Priority</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<List>
						{deleteArtifacts.map(({ artifact, selected }, i) => (
							<ListItem key={i}>
								<ListItemContent>
									<ArtifactCard
										artifact={artifact}
										sx={{
											':hover': { cursor: 'pointer' },
											'border': selected ? '1px solid red' : undefined,
										}}
										onClick={() => {
											setDeleteArtifacts((deleteArtifacts) => {
												deleteArtifacts[i].selected = !selected;
												return [...deleteArtifacts];
											});
										}}
									/>
								</ListItemContent>
								<Typography>{Math.round(artifact.tier.potential * 100)}%</Typography>
							</ListItem>
						))}
					</List>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							dispatch(
								goodActions.deleteArtifacts(
									deleteArtifacts
										.filter(({ selected }) => selected)
										.map(({ artifact }) => artifact),
								),
							);
							closeModal();
						}}>
						Apply
					</Button>
				</DialogActions>
			</ModalDialog>
		</ModalWrapper>
	);
}
