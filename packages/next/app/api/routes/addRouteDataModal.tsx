import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import { useRouter } from 'next/navigation';
import RouteDataForm from './routeDataForm';

export default function AddRouteDataModal() {
	const router = useRouter();
	const { closeModal } = useModalControls();

	return (
		<DialogWrapper>
			<DialogTitle>Add Route</DialogTitle>
			<RouteDataForm
				onSubmit={async (routeData) => {
					router.refresh();
					router.push(`/api/routes/${routeData.id}`);
					closeModal();
				}}
			/>
		</DialogWrapper>
	);
}
