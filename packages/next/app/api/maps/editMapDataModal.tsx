import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import axios from 'axios';
import { Formik } from 'formik';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { type MapData } from '../routes/types';
import { calcEfficiency } from './formUtils';
import MapDataForm, { type MapDataFormValues } from './mapDataForm';

export default function EditMapDataModal({ mapData }: { mapData: MapData }) {
	const router = useRouter();
	const { closeModal } = useModalControls();

	const initialValues: MapDataFormValues = useMemo(
		() => ({
			name: mapData.name ?? '',
			owner: mapData.owner ?? '',
			notes: mapData.notes ?? '',
			type: mapData.type ?? 'normal',
			location: mapData.background ?? 'none',
			spots: mapData.spots ?? 0,
			time: mapData.time ?? 0,
			mora: mapData.mora ?? 0,
			x: mapData.x ?? undefined,
			y: mapData.y ?? undefined,
			file: undefined,
		}),
		[mapData],
	);

	return (
		<DialogWrapper maxWidth='md'>
			<DialogTitle>Edit Map Details</DialogTitle>
			<Formik<MapDataFormValues>
				initialValues={initialValues}
				onSubmit={async (values) => {
					if (!values.name) throw Error('Missing Name');

					const data: MapData = {
						...mapData,
						name: values.name,
						owner: values.owner || undefined,
						notes: values.notes || undefined,
						type: values.type === 'normal' ? undefined : values.type,
						background: values.location === 'none' ? undefined : values.location,
						spots: values.spots,
						time: values.time,
						mora: values.mora,
						efficiency: calcEfficiency(values.spots, values.time),
						x: values.x ?? undefined,
						y: values.y ?? undefined,
					};

					await axios.post(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${mapData.id}`, data, {
						headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` },
					});
					if (values.file) {
						await axios.put(
							`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${mapData.id}`,
							values.file,
							{
								headers: {
									'Authorization': `Bearer ${Cookies.get('AUTH_TOKEN')}`,
									'Content-Type': values.file.type,
								},
							},
						);
					}
					router.refresh();
					closeModal();
				}}>
				<MapDataForm requireFile={false} showResetCoordinates />
			</Formik>
		</DialogWrapper>
	);
}
