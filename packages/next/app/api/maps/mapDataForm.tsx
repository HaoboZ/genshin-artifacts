import InputField from '@/components/form/inputField';
import NumberSpinnerField from '@/components/form/numberSpinnerField';
import SelectField from '@/components/form/selectField';
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	FormControl,
	FormLabel,
	Grid,
	MenuItem,
	TextField,
} from '@mui/material';
import Image from 'next/image';
import { useMemo } from 'react';
import { FormProvider, type SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toTitleCase } from 'remeda';
import { type BackgroundType, type MapData } from '../routes/types';
import { addFile, upsertMap } from './actions';
import { calcEfficiency, LOCATION_TYPES, MAP_TYPES } from './formUtils';
import RelocateMapPicker from './relocateMapPicker';

export type MapDataFormValues = Omit<MapData, 'id' | 'points' | 'background'> & {
	location: BackgroundType;
	file?: File;
};

export default function MapDataForm({
	initialValues,
	onSubmit,
}: {
	initialValues?: Partial<MapData>;
	onSubmit?: SubmitHandler<MapData>;
}) {
	const defaultValues = useMemo<MapDataFormValues>(
		() => ({
			name: initialValues?.name ?? '',
			owner: initialValues?.owner ?? '',
			notes: initialValues?.notes ?? '',
			type: initialValues?.type ?? 'none',
			location: initialValues?.background ?? 'none',
			spots: initialValues?.spots ?? 0,
			time: initialValues?.time ?? 0,
			mora: initialValues?.mora ?? 0,
			x: initialValues?.x,
			y: initialValues?.y,
			file: undefined,
		}),
		[initialValues],
	);
	const methods = useForm<MapDataFormValues>({ defaultValues });
	const { control, setValue, handleSubmit, formState } = methods;
	const [file, x, y] = useWatch({ name: ['file', 'x', 'y'], control });

	const preview = useMemo(() => (file ? URL.createObjectURL(file) : ''), [file]);

	return (
		<FormProvider {...methods}>
			<form
				onSubmit={handleSubmit(async (formValues) => {
					if (!formValues.name) throw Error('Missing Name');
					if (!initialValues?.id && !formValues.file) throw Error('Missing Map Image');

					const id = initialValues?.id ?? '';
					const mapData: MapData = {
						...initialValues,
						id,
						name: formValues.name,
						owner: formValues.owner || undefined,
						notes: formValues.notes || undefined,
						type: formValues.type === 'none' ? undefined : formValues.type,
						background: formValues.location === 'none' ? undefined : formValues.location,
						spots: formValues.spots,
						mora: formValues.mora,
						time: formValues.time,
						efficiency: calcEfficiency(formValues.spots, formValues.time),
						x: formValues.x,
						y: formValues.y,
						points: initialValues?.points ?? [],
					};

					mapData.id = await upsertMap(mapData);
					if (formValues.file) {
						await addFile(mapData.id, formValues.file);
					}
					onSubmit?.(mapData);
				})}>
				<DialogContent>
					<Grid container spacing={1} sx={{ pt: 1 }}>
						<Grid size={{ xs: 12, sm: 6 }}>
							<InputField name='name' label='Name' />
						</Grid>
						<Grid size={{ xs: 12, sm: 6 }}>
							<InputField name='owner' label='Owner' />
						</Grid>
						<Grid size={12}>
							<InputField name='notes' label='Notes' multiline minRows={2} />
						</Grid>
						<Grid size={{ xs: 6, sm: 4 }}>
							<SelectField name='type' label='Type'>
								{MAP_TYPES.map((value) => (
									<MenuItem key={value} value={value}>
										{toTitleCase(value)}
									</MenuItem>
								))}
							</SelectField>
						</Grid>
						<Grid size={{ xs: 6, sm: 4 }}>
							<SelectField name='location' label='Location'>
								{LOCATION_TYPES.map((value) => (
									<MenuItem key={value} value={value}>
										{toTitleCase(value)}
									</MenuItem>
								))}
							</SelectField>
						</Grid>
						<Grid size={{ xs: 6, sm: 4 }}>
							<FormControl>
								<FormLabel>Map</FormLabel>
								<TextField
									type='file'
									required={!initialValues?.id}
									slotProps={{ htmlInput: { accept: 'image/*' } }}
									onChange={(e) => {
										setValue('file', (e.target as HTMLInputElement).files?.[0]);
									}}
								/>
							</FormControl>
						</Grid>
						{preview && (
							<Grid size={12}>
								<Image
									src={preview}
									alt='map preview'
									width={800}
									height={200}
									unoptimized
									style={{ width: '100%', maxHeight: 200, objectFit: 'contain' }}
								/>
							</Grid>
						)}
						<Grid size={{ xs: 6, sm: 4 }}>
							<NumberSpinnerField size='small' min={0} name='spots' label='Spots' />
						</Grid>
						<Grid size={{ xs: 6, sm: 4 }}>
							<NumberSpinnerField size='small' min={0} name='mora' label='Mora Spots' />
						</Grid>
						<Grid size={{ xs: 6, sm: 4 }}>
							<InputField
								name='time'
								label='Time (sec)'
								type='number'
								slotProps={{ htmlInput: { step: '0.1' } }}
								onChange={(e) => setValue('time', +e.target.value)}
							/>
						</Grid>
						<Grid size={12} sx={{ position: 'relative' }}>
							<RelocateMapPicker
								x={x}
								y={y}
								onChange={(point) => {
									setValue('x', point.x);
									setValue('y', point.y);
								}}
							/>
							<Box sx={{ position: 'absolute', top: 8, left: 8 }}>
								<Button
									variant='contained'
									color='warning'
									onClick={() => {
										setValue('x', undefined);
										setValue('y', undefined);
									}}>
									Reset X/Y
								</Button>
							</Box>
						</Grid>
					</Grid>
				</DialogContent>
				<DialogActions>
					<Button type='submit' variant='contained' loading={formState.isSubmitting}>
						Submit
					</Button>
				</DialogActions>
			</form>
		</FormProvider>
	);
}
