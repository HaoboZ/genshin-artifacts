import { KeyboardArrowUp as KeyboardArrowUpIcon } from '@mui/icons-material';
import { Fab, useScrollTrigger, Zoom } from '@mui/material';

export default function ScrollTop() {
	const trigger = useScrollTrigger({ disableHysteresis: true });

	return (
		<Zoom in={trigger}>
			<Fab
				color='secondary'
				size='medium'
				sx={{
					position: 'fixed',
					zIndex: 'snackbar',
					bottom: 'calc(env(safe-area-inset-bottom) + 24px)',
					right: 'calc(env(safe-area-inset-right) + 24px)',
					mb: { xs: 8, sm: 0 },
				}}
				onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
				<KeyboardArrowUpIcon />
			</Fab>
		</Zoom>
	);
}
