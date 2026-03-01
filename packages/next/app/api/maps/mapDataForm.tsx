import AsyncButton from '@/components/loaders/asyncButton';
import {
	Box,
	Button,
	DialogActions,
	DialogContent,
	Grid,
	MenuItem,
	TextField,
} from '@mui/material';
import { useFormikContext } from 'formik';
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
	x: number | null;
	y: number | null;
	file?: File;
};

export default function MapDataForm({
	requireFile,
	showResetCoordinates,
}: {
	requireFile: boolean;
	showResetCoordinates?: boolean;
}) {
	const { values, setFieldValue, handleChange, submitForm } =
		useFormikContext<MapDataFormValues>();
	const preview = useMemo(
		() => (values.file ? URL.createObjectURL(values.file) : ''),
		[values.file],
	);

	return (
		<>
			<DialogContent>
				<Grid container spacing={1} sx={{ pt: 1 }}>
					<Grid size={6}>
						<TextField
							fullWidth
							label='Name'
							name='name'
							value={values.name}
							onChange={handleChange}
						/>
					</Grid>
					<Grid size={6}>
						<TextField
							fullWidth
							label='Owner'
							name='owner'
							value={values.owner}
							onChange={handleChange}
						/>
					</Grid>
					<Grid size={12}>
						<TextField
							fullWidth
							label='Notes'
							name='notes'
							value={values.notes}
							onChange={handleChange}
							multiline
							minRows={2}
						/>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							select
							label='Type'
							name='type'
							value={values.type}
							onChange={handleChange}>
							{MAP_TYPES.map((value) => (
								<MenuItem key={value} value={value}>
									{toTitleCase(value)}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							select
							label='Location'
							name='location'
							value={values.location}
							onChange={handleChange}>
							{LOCATION_TYPES.map((value) => (
								<MenuItem key={value} value={value}>
									{toTitleCase(value)}
								</MenuItem>
							))}
						</TextField>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='file'
							required={requireFile}
							slotProps={{ htmlInput: { accept: 'image/*' } }}
							onChange={(e) =>
								setFieldValue('file', (e.target as HTMLInputElement).files?.[0])
							}
						/>
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
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Spots'
							name='spots'
							value={values.spots}
							onChange={(e) => setFieldValue('spots', +e.target.value)}
						/>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Mora'
							name='mora'
							value={values.mora}
							onChange={(e) => setFieldValue('mora', +e.target.value)}
						/>
					</Grid>
					<Grid size={4}>
						<TextField
							fullWidth
							type='number'
							label='Time'
							name='time'
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
						{showResetCoordinates && (
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
						)}
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<AsyncButton variant='contained' onClick={submitForm}>
					Submit
				</AsyncButton>
			</DialogActions>
		</>
	);
}
