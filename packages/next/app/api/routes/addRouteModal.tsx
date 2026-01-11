import AddItemModal from '@/components/modals/addItemModal';
import { useRouter } from 'next/navigation';
import { createRoute } from './actions';

export default function AddRouteModal() {
	const router = useRouter();

	return (
		<AddItemModal
			title='Add Route'
			fields={[
				{ label: 'Name', key: 'name' },
				{ label: 'Owner', key: 'owner' },
			]}
			onSubmit={async ({ name, owner }) => {
				const id = await createRoute(name, owner);
				router.push(`/api/routes/${id}`);
			}}
		/>
	);
}
