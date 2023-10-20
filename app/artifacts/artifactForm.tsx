import ArtifactImage from '@/components/images/artifact';
import type { IArtifact } from '@/src/good';
import { data } from '@/src/resources/data';
import { artifactOrder, artifactTypeInfo, statName, stats, subStats } from '@/src/resources/stats';
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { clamp } from 'lodash';
import type { Dispatch, SetStateAction } from 'react';

export default function ArtifactForm({
	artifact,
	setArtifact,
}: {
	artifact: IArtifact;
	setArtifact: Dispatch<SetStateAction<IArtifact>>;
}) {
	const artifactSet = data.artifacts[artifact.setKey];
	const substatsIndex = [...Array(Math.min(artifact.substats.length + 1, 4))];

	return (
		<Grid container spacing={1} my={1}>
			<Grid item xs={6}>
				<FormControl fullWidth>
					<InputLabel>Set</InputLabel>
					<Select
						label='Set'
						value={artifact.setKey}
						onChange={({ target }) => {
							const rarity = data.artifacts[target.value].rarity;
							setArtifact((artifact) => ({
								...artifact,
								setKey: target.value as any,
								rarity,
								level: rarity * 4,
							}));
						}}>
						{Object.values(data.artifacts).map((artifact) => (
							<MenuItem key={artifact.key} value={artifact.key}>
								{artifact.name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>
			<Grid item xs={6} />
			<Grid item xs={3}>
				<FormControl fullWidth>
					<InputLabel>Type</InputLabel>
					<Select
						label='Type'
						value={artifact.slotKey}
						onChange={({ target }) =>
							setArtifact((artifact) => ({
								...artifact,
								mainStatKey:
									target.value === 'flower'
										? 'hp'
										: target.value === 'plume'
										? 'atk'
										: 'hp_',
								slotKey: target.value as any,
							}))
						}>
						{artifactOrder.map((key) => (
							<MenuItem key={key} value={key}>
								{artifactTypeInfo[key].name}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>
			<Grid item xs={3}>
				<FormControl fullWidth>
					<InputLabel>Main Stat</InputLabel>
					<Select
						disabled={artifact.slotKey === 'flower' || artifact.slotKey === 'plume'}
						label='Main Stat'
						value={artifact.mainStatKey}
						onChange={({ target }) =>
							setArtifact((artifact) => ({
								...artifact,
								mainStatKey: target.value as any,
							}))
						}>
						{artifactTypeInfo[artifact.slotKey].stats.map((key) => (
							<MenuItem key={key} value={key}>
								{statName[key]}
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>
			<Grid item xs={3}>
				<FormControl fullWidth>
					<InputLabel>Rarity</InputLabel>
					<Select
						label='Rarity'
						value={artifact.rarity}
						onChange={({ target }) =>
							setArtifact((artifact) => ({
								...artifact,
								rarity: +target.value,
							}))
						}>
						{[artifactSet.rarity, artifactSet.rarity - 1].map((rarity) => (
							<MenuItem key={rarity} value={rarity}>
								{rarity}*
							</MenuItem>
						))}
					</Select>
				</FormControl>
			</Grid>
			<Grid item xs={3}>
				<TextField
					fullWidth
					label='Level'
					type='number'
					value={artifact.level}
					onChange={({ target }) =>
						setArtifact((artifact) => ({
							...artifact,
							level: clamp(+target.value, 1, artifactSet.rarity * 4),
						}))
					}
				/>
			</Grid>
			<Grid item xs='auto'>
				<ArtifactImage artifactSet={artifactSet} type={artifact.slotKey} size={150} />
			</Grid>
			<Grid item xs>
				{substatsIndex.map((_, index) => (
					<FormControl key={index} fullWidth size='small'>
						<InputLabel>SubStat {index + 1}</InputLabel>
						<Select
							label={`SubStat ${index + 1}`}
							value={artifact.substats[index]?.key ?? ''}
							onChange={({ target }) => {
								const substats = [...artifact.substats];
								if (target.value === '') substats.splice(index, 1);
								else substats[index] = { key: target.value as any, value: 0 };
								setArtifact((artifact) => ({ ...artifact, substats }));
							}}>
							<MenuItem value=''>None</MenuItem>
							{subStats.map((subStat) => (
								<MenuItem key={subStat} value={subStat}>
									{statName[subStat]}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				))}
			</Grid>
			<Grid item xs>
				{substatsIndex.slice(0, -1).map((_, index) => (
					<TextField
						key={index}
						fullWidth
						size='small'
						label={`Value ${index + 1}`}
						type='number'
						value={artifact.substats[index].value}
						onChange={({ target }) => {
							const substats = [...artifact.substats];
							const { key } = artifact.substats[index];
							substats[index] = {
								key,
								value: clamp(+target.value, 0, stats[key][artifact.rarity]),
							};
							setArtifact((artifact) => ({ ...artifact, substats }));
						}}
					/>
				))}
			</Grid>
		</Grid>
	);
}
