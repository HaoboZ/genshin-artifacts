import AsyncButton from '@/components/loaders/asyncButton';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createMap } from './actions';

export default function AddMapModal({ x, y }: { x?: number; y?: number }) {
	const router = useRouter();
	const { closeModal } = useModalControls();
	const [name, setName] = useState('');
	const [owner, setOwner] = useState('');
	const [file, setFile] = useState<File>();

	return (
		<DialogWrapper maxWidth='xs'>
			<DialogTitle>Add Map</DialogTitle>
			<DialogContent>
				<Stack spacing={1} sx={{ pt: 1 }}>
					<TextField label='Name' value={name} onChange={(e) => setName(e.target.value)} />
					<TextField label='Owner' value={owner} onChange={(e) => setOwner(e.target.value)} />
					<TextField
						required
						type='file'
						inputProps={{ accept: 'image/*' }}
						onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0])}
					/>
				</Stack>
			</DialogContent>
			<DialogActions>
				<AsyncButton
					variant='contained'
					onClick={async () => {
						if (!name || !file) throw Error('Missing Name or Map Image');

						const id = await createMap(name, owner);
						await axios.post(
							`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}.json`,
							{ id, name, owner, points: [], x, y },
							{ headers: { Authorization: `Bearer ${Cookies.get('AUTH_TOKEN')}` } },
						);
						await axios.put(`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}.json`, file, {
							headers: {
								'Authorization': `Bearer ${Cookies.get('AUTH_TOKEN')}`,
								'Content-Type': file.type,
							},
						});
						router.refresh();
						router.push(`/api/maps/${id}`);
						closeModal();
					}}>
					Create
				</AsyncButton>
			</DialogActions>
		</DialogWrapper>
	);
}
