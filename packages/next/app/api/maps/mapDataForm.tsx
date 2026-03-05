import InputField from '@/components/formik/inputField';
import SelectField from '@/components/formik/selectField';
import AsyncButton from '@/components/loaders/asyncButton';
import NumberSpinner from '@/components/numberSpinner';
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	FormControl,
	FormLabel,
	Grid,
	MenuItem,
	Stack,
	TextField,
} from '@mui/material';
import { Form, useFormikContext } from 'formik';
import Image from 'next/image';
import { useMemo } from 'react';
import { toTitleCase } from 'remeda';
import { type BackgroundType, type MapType } from '../routes/types';
import { LOCATION_TYPES, MAP_TYPES } from './formUtils';
import RelocateMapPicker from './relocateMapPicker';

export type MapDataFormValues = {
	name: string;
	owner: string;
	notes: string;
	type: MapType;
	location: BackgroundType;
	spots: number;
	time: number;
	mora: number;
	x?: number;
	y?: number;
	file?: File;
};

export default function MapDataForm({ requireFile }: { requireFile: boolean }) {
	const { values, setFieldValue } = useFormikContext<MapDataFormValues>();

	const preview = useMemo(
		() => (values.file ? URL.createObjectURL(values.file) : ''),
		[values.file],
	);

	return (
		<Form>
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
						<SelectField label='Type' name='type'>
							{MAP_TYPES.map((value) => (
								<MenuItem key={value} value={value}>
									{toTitleCase(value)}
								</MenuItem>
							))}
						</SelectField>
					</Grid>
					<Grid size={{ xs: 6, sm: 4 }}>
						<SelectField label='Location' name='location'>
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
								required={requireFile}
								slotProps={{ htmlInput: { accept: 'image/*' } }}
								onChange={(e) =>
									setFieldValue('file', (e.target as HTMLInputElement).files?.[0])
								}
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
						<Stack direction='row'>
							<FormControl>
								<FormLabel>Spots</FormLabel>
								<NumberSpinner
									size='small'
									min={0}
									value={values.spots}
									onValueChange={(amount) => {
										setFieldValue('spots', amount);
									}}
								/>
							</FormControl>
						</Stack>
					</Grid>
					<Grid size={{ xs: 6, sm: 4 }}>
						<FormControl>
							<FormLabel>Mora Spots</FormLabel>
							<NumberSpinner
								size='small'
								min={0}
								value={values.mora}
								onValueChange={(amount) => {
									setFieldValue('mora', amount);
								}}
							/>
						</FormControl>
					</Grid>
					<Grid size={{ xs: 6, sm: 4 }}>
						<InputField
							label='Time'
							name='time'
							type='number'
							slotProps={{ htmlInput: { step: '0.1' } }}
							value={values.time}
							onChange={(e) => setFieldValue('time', +e.target.value)}
						/>
					</Grid>
					<Grid size={12} sx={{ position: 'relative' }}>
						<RelocateMapPicker
							x={values.x}
							y={values.y}
							onChange={(point) => {
								setFieldValue('x', point.x);
								setFieldValue('y', point.y);
							}}
						/>
						<Box sx={{ position: 'absolute', top: 8, left: 8 }}>
							<Button
								variant='contained'
								color='warning'
								onClick={() => {
									setFieldValue('x', undefined);
									setFieldValue('y', undefined);
								}}>
								Reset X/Y
							</Button>
						</Box>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<AsyncButton type='submit' variant='contained'>
					Submit
				</AsyncButton>
			</DialogActions>
		</Form>
	);
}
