import { Button, DialogActions, DialogContent, Grid, TextField } from '@mui/material';
import { Form, useFormikContext } from 'formik';

export type RouteDataFormValues = {
	name: string;
	owner: string;
	notes: string;
};

export default function RouteDataForm() {
	const { values, handleChange, isSubmitting } = useFormikContext<RouteDataFormValues>();

	return (
		<Form>
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
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button type='submit' variant='contained' loading={isSubmitting}>
					Submit
				</Button>
			</DialogActions>
		</Form>
	);
}
