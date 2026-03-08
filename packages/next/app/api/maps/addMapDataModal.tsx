import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import { useRouter } from 'next/navigation';
import MapDataForm from './mapDataForm';

export default function AddMapDataModal() {
	const router = useRouter();
	const { closeModal } = useModalControls();

	return (
		<DialogWrapper maxWidth='md'>
			<DialogTitle>Add Map</DialogTitle>
			<MapDataForm
				onSubmit={async (mapData) => {
					router.refresh();
					router.push(`/api/maps/${mapData.id}`);
					closeModal();
				}}
			/>
		</DialogWrapper>
	);
}
