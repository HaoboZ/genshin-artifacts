import { missingArtifactSets } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { potentialStatRollPercent } from '@/api/stats';
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
import ArtifactStatImage from '../artifactStatImage';
import getArtifactSetBuild from '../getArtifactSetBuild';

export default function ArtifactDeleteModal() {
	const { closeModal } = useModalControls();
	const dispatch = useAppDispatch();
	const artifacts = useAppSelector(pget('good.artifacts'));

	const artifactCounts = useMemo(
		() =>
			artifacts.reduce((counts, { setKey, slotKey }) => {
				if (!counts[setKey])
					counts[setKey] = { flower: 0, plume: 0, sands: 0, goblet: 0, circlet: 0 };
				counts[setKey][slotKey]++;
				return counts;
			}, {}),
		[],
	);

	const [deleteArtifacts, setDeleteArtifacts] = useState(() =>
		pipe(
			artifacts,
			filter(({ lock, location, level }) => lock && !location && !level),
			map((artifact) => {
				const build = getArtifactSetBuild(
					[...Object.values(builds), ...Object.values(missingArtifactSets)],
					artifact.setKey,
				);
				return {
					...artifact,
					potential: potentialStatRollPercent(build, artifact),
				};
			}),
			filter(
				({ potential, setKey, slotKey }) =>
					potential < (slotKey === 'flower' || slotKey === 'plume' ? 0.6 : 0.4) &&
					artifactCounts[setKey]?.[slotKey] > 1,
			),
			sortBy(pget('potential')),
			map((artifact) => ({ artifact, selected: true })),
		),
	);

	return (
		<ModalWrapper>
			<ModalDialog minWidth='md'>
				<DialogTitle>Delete Artifact Priority</DialogTitle>
				<ModalClose variant='outlined' />
				<DialogContent>
					<List>
						{deleteArtifacts.map(({ artifact, selected }, i) => (
							<ListItem key={i}>
								<ListItemContent>
									<ArtifactStatImage
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
								<Typography>{Math.round(artifact.potential * 100)}%</Typography>
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
						Delete
					</Button>
					<Button
						onClick={() => {
							dispatch(goodActions.deleteUnlockedArtifacts());
						}}>
						Delete Unlocked
					</Button>
				</DialogActions>
			</ModalDialog>
		</ModalWrapper>
	);
}
