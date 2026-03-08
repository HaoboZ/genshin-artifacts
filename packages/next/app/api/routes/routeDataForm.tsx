import { Button, DialogActions, DialogContent, Grid, TextField } from '@mui/material';
import { useMemo } from 'react';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { upsertRoute } from './actions';
import { type RouteData } from './types';

export type RouteDataFormValues = {
	name: string;
	owner: string;
	notes: string;
};

export default function RouteDataForm({
	initialValues,
	onSubmit,
}: {
	initialValues?: Partial<RouteData>;
	onSubmit?: SubmitHandler<RouteData>;
}) {
	const defaultValues = useMemo<RouteDataFormValues>(
		() => ({
			name: initialValues?.name ?? '',
			owner: initialValues?.owner ?? '',
			notes: initialValues?.notes ?? '',
		}),
		[initialValues],
	);
	const { register, handleSubmit, formState } = useForm<RouteDataFormValues>({ defaultValues });

	return (
		<form
			onSubmit={handleSubmit(async (values) => {
				if (!values.name) throw Error('Missing Name');

				const routeData: RouteData = {
					...initialValues,
					id: initialValues?.id ?? '',
					name: values.name,
					owner: values.owner || undefined,
					notes: values.notes || undefined,
					maps: initialValues?.maps ?? [],
				};
				routeData.id = await upsertRoute(routeData);
				onSubmit?.(routeData);
			})}>
			<DialogContent>
				<Grid container spacing={1} sx={{ pt: 1 }}>
					<Grid size={6}>
						<TextField fullWidth label='Name' {...register('name')} />
					</Grid>
					<Grid size={6}>
						<TextField fullWidth label='Owner' {...register('owner')} />
					</Grid>
					<Grid size={12}>
						<TextField fullWidth label='Notes' multiline minRows={2} {...register('notes')} />
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button type='submit' variant='contained' loading={formState.isSubmitting}>
					Submit
				</Button>
			</DialogActions>
		</form>
	);
}
