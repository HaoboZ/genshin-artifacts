import eslintNextPlugin from '@next/eslint-plugin-next';
import nextVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	{
		plugins: { next: eslintNextPlugin },
		settings: { next: { rootDir: 'packages/next' } },
	},
	...nextVitals,
	...typescript,
	prettier,
	globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
			},
		},
		rules: {
			// react
			'react/display-name': 'off',
			// typescript
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
		},
	},
]);
