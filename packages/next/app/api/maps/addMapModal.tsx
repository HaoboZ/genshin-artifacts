import AsyncButton from '@/components/loaders/asyncButton';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import {
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	TextField,
	Typography,
} from '@mui/material';
import axios from 'axios';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createMap } from './actions';

export default function AddMapModal() {
	const router = useRouter();
	const { closeModal } = useModalControls();
	const [name, setName] = useState('');
	const [owner, setOwner] = useState('');
	const [notes, setNotes] = useState('');
	const [file, setFile] = useState<File>();
	const [x, setX] = useState<number>();
	const [y, setY] = useState<number>();

	return (
		<DialogWrapper maxWidth='md'>
			<DialogTitle>Add Map</DialogTitle>
			<DialogContent>
				<Grid container spacing={1} sx={{ pt: 1 }}>
					<Grid size={6}>
						<TextField
							fullWidth
							label='Name'
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</Grid>
					<Grid size={6}>
						<TextField
							fullWidth
							label='Owner'
							value={owner}
							onChange={(e) => setOwner(e.target.value)}
						/>
					</Grid>
					<Grid size={12}>
						<TextField
							fullWidth
							label='Notes'
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							multiline
							minRows={2}
						/>
					</Grid>
					<Grid size={6}>
						<TextField
							fullWidth
							required
							type='file'
							inputProps={{ accept: 'image/*' }}
							onChange={(e) => setFile((e.target as HTMLInputElement).files?.[0])}
						/>
					</Grid>
					<Grid size={3}>
						<TextField fullWidth label='X' value={x ?? ''} inputProps={{ readOnly: true }} />
					</Grid>
					<Grid size={3}>
						<TextField fullWidth label='Y' value={y ?? ''} inputProps={{ readOnly: true }} />
					</Grid>
					<Grid size={12}>
						<Typography variant='body2'>Click on Teyvat to set map coordinates</Typography>
						<Grid
							onClick={(e) => {
								const rect = e.currentTarget.getBoundingClientRect();
								setX((e.clientX - rect.left) / rect.width);
								setY((e.clientY - rect.top) / rect.height);
							}}
							sx={{
								position: 'relative',
								width: '100%',
								aspectRatio: '16/9',
								cursor: 'crosshair',
							}}>
							<Image
								fill
								alt='teyvat'
								src={`${process.env.NEXT_PUBLIC_ROUTE_URL}/images/teyvat.png`}
								style={{ objectFit: 'contain' }}
							/>
							{x !== undefined && y !== undefined && (
								<Grid
									sx={{
										position: 'absolute',
										left: `${x * 100}%`,
										top: `${y * 100}%`,
										width: 12,
										height: 12,
										borderRadius: '50%',
										bgcolor: 'error.main',
										transform: 'translate(-50%, -50%)',
									}}
								/>
							)}
						</Grid>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<AsyncButton
					variant='contained'
					onClick={async () => {
						if (!name || !file || x === undefined || y === undefined) {
							throw Error('Missing Name, Map Image, or Coordinates');
						}

						const id = await createMap(name, owner, notes);
						await axios.post(
							`${process.env.NEXT_PUBLIC_ROUTE_URL}/maps/${id}.json`,
							{ id, name, owner, notes, points: [], x, y },
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
