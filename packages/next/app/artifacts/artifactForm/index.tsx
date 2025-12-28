import { artifactSetsInfo, artifactSlotOrder } from '@/api/artifacts';
import { artifactSlotStats, statName, statsMax, subStats } from '@/api/stats';
import AutocompleteField from '@/components/formik/autocompleteField';
import InputField from '@/components/formik/inputField';
import SelectField from '@/components/formik/selectField';
import SwitchField from '@/components/formik/switchField';
import Scanner from '@/components/scanner';
import { type ArtifactSetKey, type IArtifact, type StatKey } from '@/types/good';
import {
	Button,
	Checkbox,
	DialogActions,
	DialogContent,
	FormControlLabel,
	Grid,
	MenuItem,
	TextField,
} from '@mui/material';
import { useFormikContext } from 'formik';
import { Fragment, type ReactNode } from 'react';
import { clamp } from 'remeda';
import ArtifactImage from '../artifactImage';

export default function ArtifactForm({ deleteButton }: { deleteButton?: ReactNode }) {
	const { handleSubmit, values, setValues, setFieldValue } = useFormikContext<IArtifact>();

	const artifactSet = artifactSetsInfo[values.setKey];

	return (
		<Fragment>
			<DialogContent sx={{ pb: 0 }}>
				<Grid container spacing={1} sx={{ my: 1 }}>
					<Grid size={6}>
						<AutocompleteField
							autoHighlight
							disableClearable
							name='setKey'
							renderInput={(params) => <TextField {...params} label='Set' />}
							options={Object.keys(artifactSetsInfo)}
							getOptionLabel={(set) => artifactSetsInfo[set].name}
							onChange={(_, value) => {
								const { rarity } = artifactSetsInfo[value as any as ArtifactSetKey];
								setValues((artifact) => ({ ...artifact, rarity, level: rarity * 4 }));
							}}
						/>
					</Grid>
					<Grid size={1.5} sx={{ display: 'flex', alignItems: 'center' }}>
						<FormControlLabel control={<SwitchField name='lock' />} label='Locked' />
					</Grid>
					<Grid size={1.5} sx={{ display: 'flex', alignItems: 'center' }}>
						<FormControlLabel control={<SwitchField name='astralMark' />} label='Marked' />
					</Grid>
					<Grid
						size={3}
						sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
						<Scanner setArtifact={setValues} />
					</Grid>
					<Grid size={3}>
						<SelectField
							name='slotKey'
							label='Type'
							onChange={(e) => {
								setFieldValue(
									'mainStatKey',
									artifactSlotStats[e.target.value as any].stats[0],
								);
							}}>
							{artifactSlotOrder.map((key) => (
								<MenuItem key={key} value={key}>
									{artifactSlotStats[key].name}
								</MenuItem>
							))}
						</SelectField>
					</Grid>
					<Grid size={3}>
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
					<Grid size={3}>
						<SelectField
							name='rarity'
							label='Rarity'
							onChange={({ target }) => {
								setFieldValue('rarity', +target.value);
								setFieldValue(
									'level',
									clamp(values.level, {
										min: 0,
										max: +target.value * 4,
									}),
								);
							}}>
							{[artifactSet.rarity, artifactSet.rarity - 1].map((rarity) => (
								<MenuItem key={rarity} value={rarity}>
									{rarity}*
								</MenuItem>
							))}
						</SelectField>
					</Grid>
					<Grid size={3}>
						<InputField
							name='level'
							label='Level'
							type='number'
							onChange={({ target }) => {
								setFieldValue(
									'level',
									clamp(+target.value, { min: 0, max: artifactSet.rarity * 4 }),
								);
							}}
						/>
					</Grid>
					<Grid size='auto' sx={{ display: 'flex', alignItems: 'center' }}>
						<ArtifactImage artifact={values} />
					</Grid>
					<Grid container size='grow'>
						{[...Array(Math.min(values.substats.length + 1, 4))].map((_, index) => (
							<Fragment key={index}>
								<Grid size={7}>
									<SelectField
										name={`substats.${index}.key`}
										value={values.substats[index]?.key ?? ''}
										onChange={({ target }) => {
											const substats = [...values.substats];
											if (!target.value) substats.splice(index, 1);
											else substats[index] = { key: target.value as StatKey, value: 0 };
											setFieldValue('substats', substats);
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
								{values.substats[index] && (
									<Fragment>
										<Grid size={4}>
											<InputField
												name={`substats.${index}.value`}
												type='number'
												onChange={({ target }) => {
													const substats = [...values.substats];
													const { key } = values.substats[index];
													substats[index] = {
														key,
														value: clamp(+target.value, {
															min: 0,
															max: statsMax[key],
														}),
													};
													setFieldValue('substats', substats);
													return false;
												}}
											/>
										</Grid>
										<Grid size={1}>
											<Checkbox
												key={index}
												checked={!values.substats[index]?.unactivated}
												onChange={({ target }) => {
													setFieldValue(
														`substats.${index}.unactivated`,
														!target.checked,
													);
												}}
											/>
										</Grid>
									</Fragment>
								)}
							</Fragment>
						))}
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				{deleteButton}
				<Button variant='contained' onClick={(e) => handleSubmit(e as any)}>
					Save
				</Button>
			</DialogActions>
		</Fragment>
	);
}
