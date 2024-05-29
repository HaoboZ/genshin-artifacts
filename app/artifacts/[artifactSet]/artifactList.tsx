import { artifactSetsInfo, artifactSlotOrder, useArtifacts } from '@/api/artifacts';
import { builds } from '@/api/builds';
import { potentialStatRollPercent, weightedStatRollPercent } from '@/api/stats';
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
	Button,
	Checkbox,
	Dropdown,
	FormControl,
	FormLabel,
	Grid,
	IconButton,
	ListItem,
	ListItemButton,
	ListItemDecorator,
	Menu,
	MenuButton,
	MenuItem,
	Stack,
	Switch,
	Typography,
} from '@mui/joy';
import { capitalCase } from 'change-case';
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
					potential: potentialStatRollPercent(builds[artifact.location], artifact),
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
							{ potential: 'potential', stats: 'statRollPercent', level: 'level' }[sortType],
						) as number) * (sortDir ? 1 : -1),
					({ slotKey }) => artifactSlotOrder.indexOf(slotKey),
				),
			),
		[artifacts, sortDir, sortType, filtered],
	);

	return (
		<PageSection
			title={artifactSetsInfo[artifactSet].name}
			actions={
				<FormControl orientation='horizontal'>
					<FormLabel>Delete Mode</FormLabel>
					<Switch
						size='lg'
						sx={{ ml: 0 }}
						checked={deleteMode}
						onChange={({ target }) => {
							setDeleteMode(target.checked);
							setMarked([]);
						}}
					/>
					{marked.length > 0 && (
						<Button
							sx={{ ml: 1 }}
							onClick={() => {
								if (!confirm(`Delete ${marked.length} artifacts?`)) return;
								dispatch(goodActions.deleteArtifacts(marked));
								setMarked([]);
							}}>
							Delete
						</Button>
					)}
				</FormControl>
			}>
			<Stack spacing={1} direction='row'>
				<Stack spacing={0.25} direction='row'>
					<IconButton
						variant='outlined'
						onClick={() => setSort({ sortDir: !sortDir, sortType })}>
						{sortDir ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
					</IconButton>
					<Dropdown>
						<MenuButton>{capitalCase(sortType)}</MenuButton>
						<Menu>
							{['potential', 'stats', 'level'].map((sortType) => (
								<MenuItem key={sortType} onClick={() => setSort({ sortDir, sortType })}>
									{capitalCase(sortType)}
								</MenuItem>
							))}
						</Menu>
					</Dropdown>
				</Stack>
				<Badge badgeContent={Object.values(filtered).filter(Boolean).length}>
					<Dropdown>
						<MenuButton>Filter</MenuButton>
						<Menu>
							{['equipped', 'locked'].map((filterType) => (
								<ListItem key={filterType}>
									<ListItemButton
										onClick={() => {
											filtered[filterType] = (filtered[filterType] + 1) % 3;
											setFiltered({ ...filtered });
										}}>
										<ListItemDecorator>
											<Checkbox
												checked={filtered[filterType] === 1}
												indeterminate={filtered[filterType] === 2}
											/>
										</ListItemDecorator>
										{capitalCase(filterType)}
									</ListItemButton>
								</ListItem>
							))}
						</Menu>
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
			<Grid container spacing={1}>
				{artifactsSorted.map(({ statRollPercent, potential, ...artifact }, index) => {
					const isMarked = marked.indexOf(artifact) !== -1;

					return (
						<Grid key={index} xs={6} sm={4} md={3}>
							<ArtifactStatImage
								artifact={artifact}
								sx={{
									':hover': { cursor: 'pointer' },
									'borderColor': () => {
										if (isMarked) return 'red';
										if (artifact.location) {
											if (statRollPercent > 0.6) return 'green';
											return 'blue';
										}
									},
								}}
								onClick={() => {
									if (deleteMode) {
										setMarked((marked) =>
											isMarked
												? marked.filter((item) => item !== artifact)
												: [...marked, artifact],
										);
									} else {
										showModal(ArtifactModal, { props: { artifact } });
									}
								}}>
								<Grid container xs={12} spacing={0}>
									<Grid xs={6}>
										<PercentBar p={statRollPercent}>Stats: %p</PercentBar>
									</Grid>
									<Grid xs={6}>
										<PercentBar p={potential}>Potential: %p</PercentBar>
									</Grid>
								</Grid>
							</ArtifactStatImage>
						</Grid>
					);
				})}
			</Grid>
		</PageSection>
	);
}
