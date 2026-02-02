'use client';
import { artifactSetsInfo, artifactSlotOrder, useArtifacts } from '@/api/artifacts';
import { builds } from '@/api/builds';
import Dropdown from '@/components/dropdown';
import PageLink from '@/components/page/pageLink';
import PageSection from '@/components/page/pageSection';
import PercentBar from '@/components/stats/percentBar';
import makeArray from '@/helpers/makeArray';
import { maxPotentialPercent, maxWeightedPercent } from '@/helpers/stats';
import useParamState from '@/hooks/useParamState';
import { useModal } from '@/providers/modal';
import dynamicModal from '@/providers/modal/dynamicModal';
import { useAppDispatch } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type ArtifactSetKey, type SlotKey } from '@/types/good';
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
	Grid,
	IconButton,
	ListItemIcon,
	MenuItem,
	Pagination,
	Stack,
	Switch,
	Typography,
} from '@mui/material';
import { capitalCase, pascalSnakeCase } from 'change-case';
import { useMemo, useState } from 'react';
import { capitalize, chunk, filter, map, pipe, prop, sortBy } from 'remeda';
import RarityFilter from '../../characters/rarityFilter';
import ArtifactStatCard from '../artifactStatCard';
import SlotFilter from './slotFilter';

const ArtifactModal = dynamicModal(() => import('../artifactModal'));

export default function ArtifactList({ artifactSet }: { artifactSet?: ArtifactSetKey }) {
	const dispatch = useAppDispatch();
	const { showModal } = useModal();

	const setInfo = artifactSetsInfo[artifactSet];

	const [page, setPage] = useState(0);
	const [deleteMode, setDeleteMode] = useState(false);
	const [marked, setMarked] = useState([]);
	const [{ sortDir, sortType }, setSort] = useState({ sortDir: false, sortType: 'potential' });
	const [filtered, setFiltered] = useState({
		equipped: artifactSet ? 0 : 2,
		locked: 0,
		maxLevel: artifactSet ? 0 : 1,
	});
	const [slot, setSlot] = useParamState<SlotKey>('slot', null);
	const [rarity, setRarity] = useParamState('rarity', 0);

	const artifacts = useArtifacts({ artifactSet, rarity: +rarity, slot });
	const artifactsSorted = useMemo(() => {
		return pipe(
			artifacts,
			filter(
				(artifact) =>
					(filtered.equipped
						? Boolean(+Boolean(artifact.location) - filtered.equipped + 1)
						: true) &&
					(filtered.locked ? Boolean(+artifact.lock - filtered.locked + 1) : true) &&
					(filtered.maxLevel
						? Boolean(+(artifact.level === artifact.rarity * 4) - filtered.maxLevel + 1)
						: true),
			),
			map((artifact) => ({
				...artifact,
				statRollPercent: maxWeightedPercent(
					artifact,
					artifact.location ? makeArray(builds[artifact.location]) : undefined,
				),
				potential: maxPotentialPercent(
					artifact,
					artifact.location ? makeArray(builds[artifact.location]) : undefined,
				),
			})),
			sortBy(
				[
					prop({ potential: 'potential', stats: 'statRollPercent', level: 'level' }[sortType]),
					sortDir ? 'asc' : 'desc',
				],
				({ slotKey }) => artifactSlotOrder.indexOf(slotKey),
			),
		);
	}, [artifacts, sortDir, sortType, filtered]);

	const [greatCount, goodCount] = useMemo(
		() => [
			artifactsSorted.filter(
				({ location, statRollPercent }) => location && statRollPercent > 0.6,
			).length,
			artifactsSorted.filter(({ location, statRollPercent }) => location && statRollPercent)
				.length,
		],
		[artifactsSorted],
	);

	const artifactPages = chunk(artifactsSorted, 50);

	return (
		<PageSection
			title={
				artifactSet && (
					<PageLink
						href={`https://genshin-impact.fandom.com/wiki/${pascalSnakeCase(setInfo.name)}`}
						target='_blank'
						underline='none'
						color='textPrimary'>
						{setInfo.name}
					</PageLink>
				)
			}
			actions={
				<Box>
					<FormControlLabel
						control={
							<Switch
								checked={deleteMode}
								onChange={(_, checked) => {
									setDeleteMode(checked);
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
			{artifactSet && (
				<Box sx={{ mb: 1 }}>
					<Typography>
						<b>{setInfo.effect4Pc ? '2' : '1'}-Piece Set:</b> {setInfo.effect2Pc}
					</Typography>
					{setInfo.effect4Pc && (
						<Typography>
							<b>4-Piece Set:</b> {setInfo.effect4Pc}
						</Typography>
					)}
				</Box>
			)}
			<Stack spacing={1} direction='row'>
				<Stack spacing={0.25} direction='row'>
					<IconButton onClick={() => setSort({ sortDir: !sortDir, sortType })}>
						{sortDir ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
					</IconButton>
					<Dropdown button={capitalize(sortType)}>
						{['potential', 'stats', 'level'].map((sortType) => (
							<MenuItem key={sortType} onClick={() => setSort({ sortDir, sortType })}>
								{capitalize(sortType)}
							</MenuItem>
						))}
					</Dropdown>
				</Stack>
				<Badge badgeContent={Object.values(filtered).filter(Boolean).length}>
					<Dropdown button='Filter'>
						{['equipped', 'locked', 'maxLevel'].map((filterType) => (
							<MenuItem
								key={filterType}
								onClick={() => {
									filtered[filterType] = (filtered[filterType] + 1) % 3;
									setPage(0);
									setFiltered({ ...filtered });
								}}>
								<ListItemIcon>
									<Checkbox
										checked={filtered[filterType] === 1}
										indeterminate={filtered[filterType] === 2}
									/>
								</ListItemIcon>
								{capitalCase(filterType)}
							</MenuItem>
						))}
					</Dropdown>
				</Badge>
				<SlotFilter
					slot={slot}
					setSlot={(slot) => {
						setPage(0);
						setSlot(slot);
					}}
				/>
				<RarityFilter
					rarity={rarity}
					setRarity={(rarity) => {
						setPage(0);
						setRarity(rarity);
					}}
				/>
			</Stack>
			<Typography>
				Great: {greatCount} / Good: {goodCount}
			</Typography>
			<Grid container spacing={1}>
				{artifactPages[page]?.map(({ statRollPercent, potential, ...artifact }) => {
					const isMarked = marked.find(({ id }) => artifact.id === id);

					return (
						<Grid key={artifact.id} size={{ xs: 6, sm: 4, md: 3 }}>
							<ArtifactStatCard
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
								<Grid container size={12} spacing={0}>
									<Grid size={6}>
										<PercentBar p={statRollPercent}>Stats: %p</PercentBar>
									</Grid>
									<Grid size={6}>
										<PercentBar p={potential}>Potential: %p</PercentBar>
									</Grid>
								</Grid>
							</ArtifactStatCard>
						</Grid>
					);
				})}
			</Grid>
			<Pagination
				sx={{ my: 1, justifySelf: 'center' }}
				count={artifactPages.length}
				page={page + 1}
				onChange={(_, page) => setPage(page - 1)}
			/>
		</PageSection>
	);
}
