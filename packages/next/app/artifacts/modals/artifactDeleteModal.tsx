import { missingArtifactSets } from '@/api/artifacts';
import { builds } from '@/api/builds';
import PercentBar from '@/components/stats/percentBar';
import { maxPotentialPercents } from '@/src/helpers/stats';
import DialogWrapper from '@/src/providers/modal/dialogWrapper';
import useModalControls from '@/src/providers/modal/useModalControls';
import { useAppDispatch, useAppSelector } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	List,
	ListItem,
	ListItemText,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useMemo, useState } from 'react';
import { filter, map, pipe, prop, sortBy } from 'remeda';
import ArtifactStatImage from '../artifactStatImage';

const buildArr = [...Object.values(builds), ...Object.values(missingArtifactSets)];

export default function ArtifactDeleteModal() {
	const { closeModal } = useModalControls();
	const dispatch = useAppDispatch();
	const artifacts = useAppSelector(prop('good', 'artifacts'));
	const { enqueueSnackbar } = useSnackbar();

	const artifactCounts = useMemo(
		() =>
			artifacts.reduce((counts, { setKey, slotKey }) => {
				if (!counts[setKey])
					counts[setKey] = { flower: 0, plume: 0, sands: 0, goblet: 0, circlet: 0 };
				counts[setKey][slotKey]++;
				return counts;
			}, {}),
		[artifacts],
	);

	const [deleteArtifacts, setDeleteArtifacts] = useState(() =>
		pipe(
			artifacts,
			filter(({ lock, location, level }) => lock && !location && !level),
			map((artifact) => ({
				...artifact,
				potential: maxPotentialPercents(buildArr, artifact),
			})),
			filter(
				({ potential, setKey, slotKey }) =>
					potential < (slotKey === 'flower' || slotKey === 'plume' ? 0.6 : 0.4) &&
					artifactCounts[setKey]?.[slotKey] > 1,
			),
			sortBy(prop('potential')),
			map((artifact) => ({ artifact, selected: true })),
		),
	);

	return (
		<DialogWrapper>
			<DialogTitle>Delete Artifact Priority</DialogTitle>
			<DialogContent>
				<List>
					{deleteArtifacts.map(({ artifact, selected }, i) => (
						<ListItem key={i}>
							<ListItemText>
								<ArtifactStatImage
									artifact={artifact}
									sx={{
										':hover': { cursor: 'pointer' },
										'border': selected ? 1 : 0,
										'borderColor': 'red',
									}}
									onClick={() => {
										setDeleteArtifacts((deleteArtifacts) => {
											deleteArtifacts[i].selected = !selected;
											return [...deleteArtifacts];
										});
									}}
								/>
								<PercentBar p={artifact.potential}>Potential: %p</PercentBar>
							</ListItemText>
						</ListItem>
					))}
				</List>
			</DialogContent>
			<DialogActions>
				<Button
					color='error'
					variant='contained'
					onClick={() => {
						dispatch(
							goodActions.deleteArtifacts(
								deleteArtifacts.filter(prop('selected')).map(prop('artifact')),
							),
						);
						closeModal();
					}}>
					Delete
				</Button>
				<Button
					color='error'
					variant='contained'
					onClick={() => {
						dispatch(goodActions.deleteUnlockedArtifacts());
						enqueueSnackbar('Deleted Unlocked Artifacts');
					}}>
					Delete Unlocked
				</Button>
			</DialogActions>
		</DialogWrapper>
	);
}
