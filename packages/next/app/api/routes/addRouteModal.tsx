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
				{ label: 'Notes', key: 'notes' },
			]}
			onSubmit={async ({ name, owner, notes }) => {
				const id = await createRoute(name, owner, notes);
				router.push(`/api/routes/${id}`);
			}}
		/>
	);
}
