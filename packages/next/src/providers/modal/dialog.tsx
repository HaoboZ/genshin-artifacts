import { Close as CloseIcon } from '@mui/icons-material';
import type { DialogProps } from '@mui/material';
import { Dialog, IconButton } from '@mui/material';
import { useModalControls } from './controls';

export default function DialogWrapper({ children, ...props }: Omit<DialogProps, 'open'>) {
	const { modalState, closeModal } = useModalControls();

	return (
		<Dialog fullWidth open={modalState.open} maxWidth='md' onClose={closeModal} {...props}>
			<IconButton
				aria-label='close'
				sx={{ position: 'absolute', right: 8, top: 8 }}
				onClick={closeModal}>
				<CloseIcon />
			</IconButton>
			{children}
		</Dialog>
	);
}
