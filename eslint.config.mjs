import nextVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
	...nextVitals,
	...typescript,
	{
		settings: {
			next: { rootDir: 'packages/next' },
		},
	},
	prettier,
	globalIgnores([
		'packages/next/.next/**',
		'packages/next/out/**',
		'packages/next/build/**',
		'packages/next/next-env.d.ts',
		'packages/image-map-route/dist/**',
		'packages/routes-worker/.wrangler',
		'packages/routes-worker/worker-configuration.d.ts',
	]),
	{
		rules: {
			// react
			'react/display-name': 'off',
			// typescript
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ fixStyle: 'inline-type-imports' },
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
		},
	},
]);
