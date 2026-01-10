import AsyncButton from '@/components/loaders/asyncButton';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createMap } from './actions';

export default function AddMapModal() {
	const router = useRouter();
	const { closeModal } = useModalControls();

	const [name, setName] = useState('');
	const [owner, setOwner] = useState('');

	return (
		<DialogWrapper maxWidth='xs'>
			<DialogTitle>Add Map</DialogTitle>
			<DialogContent>
				<Stack spacing={1} sx={{ pt: 1 }}>
					<TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} />
					<TextField label='Owner' value={owner} onChange={(e) => setOwner(e.target.value)} />
				</Stack>
			</DialogContent>
			<DialogActions>
				<AsyncButton
					variant='contained'
					onClick={async () => {
						if (!name) throw Error('Missing Name');
						const id = await createMap(name, owner);
						router.push(`/api/routes/maps/${id}`);
						closeModal();
					}}>
					Confirm
				</AsyncButton>
			</DialogActions>
		</DialogWrapper>
	);
}
