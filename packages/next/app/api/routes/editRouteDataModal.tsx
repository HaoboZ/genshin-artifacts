import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import axios from 'axios';
import { Formik } from 'formik';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import RouteDataForm, { type RouteDataFormValues } from './routeDataForm';
import { type RouteData } from './types';

export default function EditRouteDataModal({ routeData }: { routeData: RouteData }) {
	const router = useRouter();
	const { closeModal } = useModalControls();

	const initialValues = useMemo<RouteDataFormValues>(
		() => ({
			name: routeData.name ?? '',
			owner: routeData.owner ?? '',
			notes: routeData.notes ?? '',
		}),
		[routeData],
	);

	return (
		<DialogWrapper>
			<DialogTitle>Edit Route Details</DialogTitle>
			<Formik<RouteDataFormValues>
				initialValues={initialValues}
				onSubmit={async (values) => {
					if (!values.name) throw Error('Missing Name');

					const data: RouteData = {
						...routeData,
						name: values.name,
						owner: values.owner || undefined,
						notes: values.notes || undefined,
					};

					await axios.post(
						`${process.env.NEXT_PUBLIC_ROUTE_URL}/routes/${routeData.id}`,
						data,
						{
							headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` },
						},
					);
					router.refresh();
					closeModal();
				}}>
				<RouteDataForm />
			</Formik>
		</DialogWrapper>
	);
}
