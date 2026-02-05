import AsyncButton from '@/components/loaders/asyncButton';
import DialogWrapper from '@/providers/modal/dialogWrapper';
import useModalControls from '@/providers/modal/useModalControls';
import { DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import { useState } from 'react';

export default function EditJsonModal({
	data,
	onUpload,
}: {
	data: any;
	onUpload: (data: any) => Promise<void>;
}) {
	const { closeModal } = useModalControls();

	const [jsonContent, setJsonContent] = useState(JSON.stringify(data, null, '\t'));

	return (
		<DialogWrapper>
			<DialogTitle>Edit JSON</DialogTitle>
			<DialogContent>
				<TextField
					fullWidth
					multiline
					minRows={10}
					value={jsonContent}
					onChange={(e) => setJsonContent(e.target.value)}
					slotProps={{ input: { sx: { fontFamily: 'monospace' } } }}
				/>
			</DialogContent>
			<DialogActions>
				<AsyncButton
					variant='contained'
					onClick={async () => {
						try {
							const parsedData = JSON.parse(jsonContent);
							await onUpload(parsedData);
							closeModal();
						} catch {
							throw Error('Invalid JSON format');
						}
					}}>
					Save
				</AsyncButton>
			</DialogActions>
		</DialogWrapper>
	);
}
