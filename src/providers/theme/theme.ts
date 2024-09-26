'use client';
import { createTheme } from '@mui/material';

export default createTheme({
	cssVariables: true,
	colorSchemes: {
		dark: true,
	},
	typography: {
		h1: { fontSize: 34, fontWeight: 'bold' },
		h2: { fontSize: 31 },
		h3: { fontSize: 28 },
		h4: { fontSize: 25 },
		h5: { fontSize: 22 },
		h6: { fontSize: 19 },
		fontFamily: 'var(--font-roboto)',
	},
	components: {
		MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
		MuiTable: { defaultProps: { size: 'small' } },
		MuiFormControl: { defaultProps: { fullWidth: true } },
		MuiCardContent: {
			styleOverrides: {
				root: {
					':last-child': { paddingBottom: 16 },
				},
			},
		},
	},
});
