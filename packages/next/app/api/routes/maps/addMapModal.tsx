import AddItemModal from '@/components/modals/addItemModal';
import { useRouter } from 'next/navigation';
import { createMap } from './actions';

export default function AddMapModal() {
	const router = useRouter();

	return (
		<AddItemModal
			title='Add Map'
			fields={[
				{ label: 'Name', key: 'name' },
				{ label: 'Owner', key: 'owner' },
			]}
			onSubmit={async (data) => {
				const id = createMap(data.name, data.owner);
				router.push(`/api/routes/maps/${id}`);
			}}
		/>
	);
}
