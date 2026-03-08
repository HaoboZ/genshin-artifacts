import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import { useRouter } from 'next/navigation';
import { type MapData } from '../routes/types';
import MapDataForm from './mapDataForm';

export default function EditMapDataModal({ mapData }: { mapData: MapData }) {
	const router = useRouter();
	const { closeModal } = useModalControls();

	return (
		<DialogWrapper maxWidth='md'>
			<DialogTitle>Edit Map Details</DialogTitle>
			<MapDataForm
				initialValues={mapData}
				onSubmit={async () => {
					router.refresh();
					closeModal();
				}}
			/>
		</DialogWrapper>
	);
}
