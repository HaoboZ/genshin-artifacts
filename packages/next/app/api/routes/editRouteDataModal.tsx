import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogTitle } from '@mui/material';
import { useRouter } from 'next/navigation';
import RouteDataForm from './routeDataForm';
import { type RouteData } from './types';

export default function EditRouteDataModal({ routeData }: { routeData: RouteData }) {
	const router = useRouter();
	const { closeModal } = useModalControls();

	return (
		<DialogWrapper>
			<DialogTitle>Edit Route Details</DialogTitle>
			<RouteDataForm
				initialValues={routeData}
				onSubmit={async () => {
					router.refresh();
					closeModal();
				}}
			/>
		</DialogWrapper>
	);
}
