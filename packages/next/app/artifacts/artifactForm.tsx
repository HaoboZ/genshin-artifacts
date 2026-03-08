import { artifactSetsInfo, artifactSlotOrder } from '@/api/artifacts';
import { artifactSlotStats, statName, statsMax, subStats } from '@/api/stats';
import AutocompleteField from '@/components/form/autocompleteField';
import InputField from '@/components/form/inputField';
import SelectField from '@/components/form/selectField';
import SwitchField from '@/components/form/switchField';
import Scanner from '@/components/scanner';
import useModalControls from '@/providers/modal/useModalControls';
import { useAppDispatch } from '@/store/hooks';
import { goodActions } from '@/store/reducers/goodReducer';
import { type ArtifactSetKey, type IArtifact, type StatKey } from '@/types/good';
import {
	Button,
	Checkbox,
	DialogActions,
	DialogContent,
	FormControl,
	FormControlLabel,
	Grid,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
} from '@mui/material';
import { type Dispatch, Fragment, type SetStateAction } from 'react';
import { type FieldPath, type SubmitHandler, useFormContext, useWatch } from 'react-hook-form';
import { clamp } from 'remeda';
import ArtifactImage from './artifactImage';

export default function ArtifactForm({ onSubmit }: { onSubmit: SubmitHandler<IArtifact> }) {
	const dispatch = useAppDispatch();
	const { closeModal } = useModalControls();
	const { control, setValue, handleSubmit, reset, getValues } = useFormContext<IArtifact>();
	const values = useWatch({ control }) as IArtifact;
	const setArtifactValue: <FieldName extends FieldPath<IArtifact>>(
		name: FieldName,
		value: IArtifact[FieldName],
	) => void = setValue;

	const setValues: Dispatch<SetStateAction<IArtifact>> = (value) => {
		const previous = getValues();
		const next = typeof value === 'function' ? value(previous) : value;
		reset(next);
	};

	const artifactSet = artifactSetsInfo[values.setKey];

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<DialogContent sx={{ pb: 0 }}>
				<Grid container spacing={1} sx={{ my: 1 }}>
					<Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
						<AutocompleteField
							fullWidth
							autoHighlight
							disableClearable
							name='setKey'
							renderInput={(params) => <TextField {...params} label='Set' />}
							options={Object.keys(artifactSetsInfo)}
							getOptionLabel={(set) => artifactSetsInfo[set].name}
							onChange={(_, value) => {
								const { rarity } = artifactSetsInfo[value as any as ArtifactSetKey];
								setArtifactValue('rarity', rarity);
								setArtifactValue('level', rarity * 4);
							}}
						/>
					</Grid>
					<Grid size={{ xs: 6, sm: 3 }} sx={{ display: 'flex', alignItems: 'center', pl: 2 }}>
						<Stack>
							<FormControlLabel
								control={<SwitchField size='small' name='lock' />}
								label='Locked'
							/>
							<FormControlLabel
								control={<SwitchField size='small' name='astralMark' />}
								label='Marked'
							/>
						</Stack>
					</Grid>
					<Grid size={{ xs: 6, sm: 3 }} sx={{ display: 'flex', alignItems: 'center' }}>
						<Scanner setArtifact={setValues} />
					</Grid>
					<Grid size={{ xs: 6, sm: 3 }}>
						<SelectField
							name='slotKey'
							label='Type'
							onChange={(e) => {
								const nextSlot = e.target.value as keyof typeof artifactSlotStats;
								setArtifactValue('mainStatKey', artifactSlotStats[nextSlot].stats[0]);
							}}>
							{artifactSlotOrder.map((key) => (
								<MenuItem key={key} value={key}>
									{artifactSlotStats[key].name}
								</MenuItem>
							))}
						</SelectField>
					</Grid>
					<Grid size={{ xs: 6, sm: 3 }}>
						<SelectField
							name='mainStatKey'
							label='Main Stat'
							disabled={values.slotKey === 'flower' || values.slotKey === 'plume'}>
							{artifactSlotStats[values.slotKey].stats.map((key) => (
								<MenuItem key={key} value={key}>
									{statName[key]}
								</MenuItem>
							))}
						</SelectField>
					</Grid>
					<Grid size={{ xs: 6, sm: 3 }}>
						<SelectField
							name='rarity'
							label='Rarity'
							onChange={(e) => {
								setArtifactValue('rarity', +e.target.value);
								setArtifactValue(
									'level',
									clamp(values.level, { min: 0, max: +e.target.value * 4 }),
								);
							}}>
							{[artifactSet.rarity, artifactSet.rarity - 1].map((rarity) => (
								<MenuItem key={rarity} value={rarity}>
									{rarity}*
								</MenuItem>
							))}
						</SelectField>
					</Grid>
					<Grid size={{ xs: 6, sm: 3 }}>
						<InputField
							name='level'
							label='Level'
							type='number'
							onChange={(e) => {
								setArtifactValue(
									'level',
									clamp(+e.target.value, { min: 0, max: artifactSet.rarity * 4 }),
								);
							}}
						/>
					</Grid>
					<Grid size='auto' sx={{ display: 'flex', alignItems: 'center' }}>
						<ArtifactImage artifact={values} />
					</Grid>
					<Grid container size='grow'>
						{values.substats.slice(0, 4).map((substat, index) => (
							<Fragment key={index}>
								<Grid size={7}>
									<SelectField
										name={`substats.${index}.key`}
										value={substat.key}
										onChange={(e) => {
											const substats = [...values.substats];
											if (!e.target.value) substats.splice(index, 1);
											else
												substats[index] = { key: e.target.value as StatKey, value: 0 };
											setArtifactValue('substats', substats);
											return false;
										}}>
										<MenuItem value=''>None</MenuItem>
										{subStats.map((subStat) => (
											<MenuItem key={subStat} value={subStat}>
												{statName[subStat]}
											</MenuItem>
										))}
									</SelectField>
								</Grid>
								<Grid size={4}>
									<InputField
										name={`substats.${index}.value`}
										type='number'
										onChange={(e) => {
											const substats = [...values.substats];
											const { key } = values.substats[index];
											substats[index] = {
												key,
												value: clamp(+e.target.value, {
													min: 0,
													max: statsMax[key],
												}),
											};
											setArtifactValue('substats', substats);
											return false;
										}}
									/>
								</Grid>
								<Grid size={1}>
									<Checkbox
										key={index}
										checked={!values.substats[index]?.unactivated}
										onChange={(_, checked) => {
											setArtifactValue(`substats.${index}.unactivated`, !checked);
										}}
									/>
								</Grid>
							</Fragment>
						))}
						{values.substats.length < 4 && (
							<Grid size={7}>
								<FormControl fullWidth size='small'>
									<InputLabel>Sub Stat</InputLabel>
									<Select
										label='Sub Stat'
										value=''
										onChange={(e) => {
											if (!e.target.value) return;
											setArtifactValue('substats', [
												...values.substats,
												{ key: e.target.value as StatKey, value: 0 },
											]);
										}}>
										<MenuItem value=''>None</MenuItem>
										{subStats.map((subStat) => (
											<MenuItem key={subStat} value={subStat}>
												{statName[subStat]}
											</MenuItem>
										))}
									</Select>
								</FormControl>
							</Grid>
						)}
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				{values.id && (
					<Button
						variant='contained'
						color='error'
						onClick={() => {
							if (!confirm('Delete this artifact?')) return;
							dispatch(goodActions.deleteArtifact(values.id));
							closeModal();
						}}>
						Delete
					</Button>
				)}
				<Button type='submit' variant='contained'>
					Save
				</Button>
			</DialogActions>
		</form>
	);
}
