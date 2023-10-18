import { colors, darkScrollbar, experimental_extendTheme } from '@mui/material';

export default experimental_extendTheme({
	colorSchemes: {
		light: {
			palette: {
				primary: { main: colors.lightBlue['600'] },
				secondary: { main: colors.red['900'] },
				background: { paper: colors.grey['100'] },
			},
		},
		dark: {
			palette: {
				primary: { main: colors.lightBlue['600'] },
				secondary: { main: colors.red['900'] },
				background: { paper: colors.grey['900'] },
			},
			// @ts-ignore
			components: {
				MuiCssBaseline: {
					styleOverrides: {
						body: darkScrollbar(),
					},
				},
			},
		},
	},
	typography: {
		h1: { fontSize: 28 },
		h2: { fontSize: 24 },
		h3: { fontSize: 22 },
		h4: { fontSize: 20 },
		h5: { fontSize: 18 },
		h6: { fontSize: 16 },
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: { backgroundImage: 'none' },
			},
		},
	},
});
