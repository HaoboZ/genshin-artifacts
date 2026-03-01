import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import { Formik } from 'formik';
import { useRouter } from 'next/navigation';
import { createRoute } from './actions';
import RouteDataForm, { type RouteDataFormValues } from './routeDataForm';

export default function AddRouteDataModal() {
	const router = useRouter();
	const { closeModal } = useModalControls();

	return (
		<DialogWrapper>
			<DialogTitle>Add Route</DialogTitle>
			<Formik<RouteDataFormValues>
				initialValues={{ name: '', owner: '', notes: '' }}
				onSubmit={async (values) => {
					if (!values.name) throw Error('Missing Name');
					const id = await createRoute(values.name, values.owner, values.notes);
					router.push(`/api/routes/${id}`);
					closeModal();
				}}>
				<RouteDataForm />
			</Formik>
		</DialogWrapper>
	);
}
