import { Close as CloseIcon } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import type { SnackbarKey } from 'notistack';
import { useSnackbar } from 'notistack';

export default function SnackbarAction(id: SnackbarKey) {
	const { closeSnackbar } = useSnackbar();

	return (
		<IconButton color='inherit' onClick={() => closeSnackbar(id)}>
			<CloseIcon />
		</IconButton>
	);
}
