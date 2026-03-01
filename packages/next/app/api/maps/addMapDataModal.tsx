import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import axios from 'axios';
import { Formik } from 'formik';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { type MapData } from '../routes/types';
import { createMap } from './actions';
import { calcEfficiency } from './formUtils';
import MapDataForm, { type MapDataFormValues } from './mapDataForm';

export default function AddMapDataModal({
	initialX,
	initialY,
	onCreated,
}: {
	initialX?: number;
	initialY?: number;
	onCreated?: (mapData: MapData) => void;
}) {
	const router = useRouter();
	const { closeModal } = useModalControls();

	const initialValues: MapDataFormValues = useMemo(
		() => ({
			name: '',
			owner: '',
			notes: '',
			type: 'normal',
			location: 'none',
			spots: 0,
			time: 0,
			mora: 0,
			x: initialX ?? 0.5,
			y: initialY ?? 0.5,
			file: undefined,
		}),
		[initialX, initialY],
	);

	return (
		<DialogWrapper maxWidth='md'>
			<DialogTitle>Add Map</DialogTitle>
			<Formik<MapDataFormValues>
				initialValues={initialValues}
				onSubmit={async (values) => {
					if (!values.name) throw Error('Missing Name');
					if (!values.file) throw Error('Missing Map Image');

					const id = await createMap(values.name, values.owner, values.notes);
					const mapData: MapData = {
						id,
						name: values.name,
						owner: values.owner || undefined,
						notes: values.notes || undefined,
						type: values.type === 'normal' ? undefined : values.type,
						background: values.location === 'none' ? undefined : values.location,
						spots: values.spots,
						mora: values.mora,
						time: values.time,
						efficiency: calcEfficiency(values.spots, values.time),
						x: values.x,
						y: values.y,
						points: [],
					};

					await axios.post(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}`, mapData, {
						headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` },
					});
					await axios.put(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}`, values.file, {
						headers: {
							'Authorization': `Bearer ${Cookies.get('AUTH_TOKEN')}`,
							'Content-Type': values.file.type,
						},
					});
					onCreated?.(mapData);
					router.refresh();
					router.push(`/api/maps/${id}`);
					closeModal();
				}}>
				<MapDataForm requireFile />
			</Formik>
		</DialogWrapper>
	);
}
