import {
	Button,
	DialogActions,
	DialogContent,
	DialogTitle,
	TextField,
	Typography,
} from '@mui/material';
import { useState } from 'react';

import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';

function toLocalInput(date: Date) {
	const pad = (value: number) => `${value}`.padStart(2, '0');
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function CustomRespawnModal({
	item,
	hours,
	onSetReminder,
}: {
	item: string;
	hours: number;
	onSetReminder: (date: Date) => Promise<void>;
}) {
	const { closeModal } = useModalControls();

	const [now] = useState(() => new Date());
	const [customTime, setCustomTime] = useState(() => {
		const date = new Date();
		date.setHours(date.getHours() + hours);
		return toLocalInput(date);
	});

	return (
		<DialogWrapper maxWidth='xs'>
			<DialogTitle>Choose respawn time</DialogTitle>
			<DialogContent>
				<Typography variant='body2' sx={{ pb: 2 }}>
					{item}
				</Typography>
				<TextField
					label='Date and time'
					type='datetime-local'
					value={customTime}
					onChange={(event) => setCustomTime(event.target.value)}
					slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: toLocalInput(now) } }}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={closeModal}>Back</Button>
				<Button
					variant='contained'
					disabled={!customTime || new Date(customTime).getTime() <= Date.now()}
					onClick={async () => {
						await onSetReminder(new Date(customTime));
						closeModal();
					}}>
					Set reminder
				</Button>
			</DialogActions>
		</DialogWrapper>
	);
}
