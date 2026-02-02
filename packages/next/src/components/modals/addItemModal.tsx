import AsyncButton from '@/components/loaders/asyncButton';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { capitalize } from 'remeda';

export default function AddItemModal({
	title,
	fields,
	onSubmit,
	requiredFields = ['name'],
}: {
	title: string;
	fields: Array<{ label: string; key: string }>;
	onSubmit: (data: Record<string, string>) => Promise<void>;
	requiredFields?: string[];
}) {
	const { closeModal } = useModalControls();

	const [data, setData] = useState<Record<string, string>>(
		fields.reduce((acc, field) => ({ ...acc, [field.key]: '' }), {}),
	);

	const validateFields = () => {
		for (const field of requiredFields) {
			if (!data[field]) {
				throw Error(`Missing ${capitalize(field)}`);
			}
		}
	};

	return (
		<DialogWrapper maxWidth='xs'>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<Stack spacing={1} sx={{ pt: 1 }}>
					{fields.map((field) => (
						<TextField
							key={field.key}
							label={field.label}
							value={data[field.key]}
							onChange={(e) => setData({ ...data, [field.key]: e.target.value })}
						/>
					))}
				</Stack>
			</DialogContent>
			<DialogActions>
				<AsyncButton
					variant='contained'
					onClick={async () => {
						validateFields();
						await onSubmit(data);
						closeModal();
					}}>
					Submit
				</AsyncButton>
			</DialogActions>
		</DialogWrapper>
	);
}
