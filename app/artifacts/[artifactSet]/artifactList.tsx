import {
	artifactSetsInfo,
	artifactSlotOrder,
	missingArtifactSets,
	useArtifacts,
} from '@/api/artifacts';
import { builds } from '@/api/builds';
import {
	potentialStatRollPercent,
	potentialStatRollPercents,
	weightedStatRollPercent,
} from '@/api/stats';
import Dropdown from '@/components/dropdown';
import PageLink from '@/components/page/link';
import PageSection from '@/components/page/section';
import PercentBar from '@/components/percentBar';
import pget from '@/src/helpers/pget';
import { useModal } from '@/src/providers/modal';
import { useAppDispatch } from '@/src/store/hooks';
import { goodActions } from '@/src/store/reducers/goodReducer';
import type { ArtifactSetKey, SlotKey } from '@/src/types/good';
import {
	ArrowDownward as ArrowDownwardIcon,
	ArrowUpward as ArrowUpwardIcon,
} from '@mui/icons-material';
import {
	Badge,
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	Grid2,
	IconButton,
	ListItem,
	ListItemButton,
	ListItemIcon,
	MenuItem,
	Stack,
	Switch,
	Typography,
} from '@mui/material';
import { capitalCase, pascalSnakeCase } from 'change-case';
import { useMemo, useState } from 'react';
import { filter, map, pipe, sortBy } from 'remeda';
import ArtifactStatImage from '../artifactStatImage';
import ArtifactModal from './artifactModal';

export default function ArtifactList({
	artifactSet,
	slot,
}: {
	artifactSet: ArtifactSetKey;
	slot: SlotKey;
}) {
	const dispatch = useAppDispatch();
	const { showModal } = useModal();

	const [deleteMode, setDeleteMode] = useState(false);
	const [marked, setMarked] = useState([]);
	const [{ sortDir, sortType }, setSort] = useState({ sortDir: false, sortType: 'potential' });
	const [filtered, setFiltered] = useState({ equipped: 0, locked: 0 });

	const artifacts = useArtifacts({ artifactSet, slot });
	const artifactsSorted = useMemo(
		() =>
			pipe(
				artifacts,
				map((artifact) => ({
					...artifact,
					statRollPercent: weightedStatRollPercent(builds[artifact.location], artifact),
					potential: artifact.location
						? potentialStatRollPercent(builds[artifact.location], artifact)
						: Math.max(
								...potentialStatRollPercents(
									[...Object.values(builds), ...Object.values(missingArtifactSets)],
									artifact,
								),
							),
				})),
				filter(
					(artifact) =>
						(filtered.equipped
							? Boolean(+Boolean(artifact.location) - filtered.equipped + 1)
							: true) &&
						(filtered.locked ? Boolean(+Boolean(artifact.lock) - filtered.locked + 1) : true),
				),
				sortBy(
					(artifact) =>
						(pget(
							artifact,
							{
								potential: 'potential',
								stats: 'statRollPercent',
								level: 'level',
							}[sortType],
						) as number) * (sortDir ? 1 : -1),
					({ slotKey }) => artifactSlotOrder.indexOf(slotKey),
				),
			),
		[artifacts, sortDir, sortType, filtered],
	);

	return (
		<PageSection
			title={
				<PageLink
					href={`https://genshin-impact.fandom.com/wiki/${pascalSnakeCase(artifactSetsInfo[artifactSet].name)}`}
					target='_blank'
					underline='none'
					color='textPrimary'>
					{artifactSetsInfo[artifactSet].name}
				</PageLink>
			}
			actions={
				<Box>
					<FormControlLabel
						control={
							<Switch
								checked={deleteMode}
								onChange={({ target }) => {
									setDeleteMode(target.checked);
									setMarked([]);
								}}
							/>
						}
						label='Delete Mode'
					/>
					{marked.length > 0 && (
						<Button
							color='error'
							variant='contained'
							onClick={() => {
								if (!confirm(`Delete ${marked.length} artifacts?`)) return;
								dispatch(goodActions.deleteArtifacts(marked));
								setMarked([]);
							}}>
							Delete
						</Button>
					)}
				</Box>
			}>
			<Stack spacing={1} direction='row'>
				<Stack spacing={0.25} direction='row'>
					<IconButton onClick={() => setSort({ sortDir: !sortDir, sortType })}>
						{sortDir ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
					</IconButton>
					<Dropdown button={capitalCase(sortType)}>
						{['potential', 'stats', 'level'].map((sortType) => (
							<MenuItem key={sortType} onClick={() => setSort({ sortDir, sortType })}>
								{capitalCase(sortType)}
							</MenuItem>
						))}
					</Dropdown>
				</Stack>
				<Badge badgeContent={Object.values(filtered).filter(Boolean).length}>
					<Dropdown button='Filter'>
						{['equipped', 'locked'].map((filterType) => (
							<ListItem key={filterType}>
								<ListItemButton
									onClick={() => {
										filtered[filterType] = (filtered[filterType] + 1) % 3;
										setFiltered({ ...filtered });
									}}>
									<ListItemIcon>
										<Checkbox
											checked={filtered[filterType] === 1}
											indeterminate={filtered[filterType] === 2}
										/>
									</ListItemIcon>
									{capitalCase(filterType)}
								</ListItemButton>
							</ListItem>
						))}
					</Dropdown>
				</Badge>
			</Stack>
			<Typography>
				Great:{' '}
				{
					artifactsSorted.filter(
						({ location, statRollPercent }) => location && statRollPercent > 0.6,
					).length
				}{' '}
				/ Good:{' '}
				{
					artifactsSorted.filter(
						({ location, statRollPercent }) => location && statRollPercent,
					).length
				}
			</Typography>
			<Grid2 container spacing={1}>
				{artifactsSorted.map(({ statRollPercent, potential, ...artifact }, index) => {
					const isMarked = marked.find(({ id }) => artifact.id === id);

					return (
						<Grid2 key={index} size={{ xs: 6, sm: 4, md: 3 }}>
							<ArtifactStatImage
								artifact={artifact}
								sx={{
									':hover': { cursor: 'pointer' },
									'border': isMarked
										? '1px solid red'
										: artifact.location
											? statRollPercent > 0.6
												? '1px solid green'
												: '1px solid blue'
											: '1px solid transparent',
								}}
								onClick={() => {
									if (deleteMode) {
										setMarked((marked) =>
											isMarked
												? marked.filter(({ id }) => id !== artifact.id)
												: [...marked, artifact],
										);
									} else {
										showModal(ArtifactModal, { props: { artifact } });
									}
								}}>
								<Grid2 container size={12} spacing={0}>
									<Grid2 size={6}>
										<PercentBar p={statRollPercent}>Stats: %p</PercentBar>
									</Grid2>
									<Grid2 size={6}>
										<PercentBar p={potential}>Potential: %p</PercentBar>
									</Grid2>
								</Grid2>
							</ArtifactStatImage>
						</Grid2>
					);
				})}
			</Grid2>
		</PageSection>
	);
}
