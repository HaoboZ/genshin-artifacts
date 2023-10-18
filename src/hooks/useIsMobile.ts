import type { Theme } from '@mui/material';
import { useMediaQuery } from '@mui/material';

export default function useIsMobile() {
	return useMediaQuery<Theme>(({ breakpoints }) => breakpoints.down('sm'));
}
