import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier/recommended';
import { dirname } from 'path';
import typescript from 'typescript-eslint';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

export default typescript.config(
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	prettier,
	{
		// plugins: { react },
		languageOptions: {
			parserOptions: {
				// ecmaVersion: 'latest',
				projectService: true,
				// ecmaFeatures: { jsx: true },
				// sourceType: 'module',
			},
			// globals: { ...globals.browser, ...globals.node },
		},
		rules: {
			// suggestions
			'dot-notation': 'off', // typescript
			'eqeqeq': 'warn',
			'no-empty': ['warn', { allowEmptyCatch: true }],
			'no-useless-computed-key': ['warn', { enforceForClassMembers: true }],
			// react
			'react/display-name': 'off',
			'react/function-component-definition': [
				'warn',
				{ namedComponents: 'function-declaration', unnamedComponents: 'arrow-function' },
			],
			'react/no-unescaped-entities': 'off',
			'react/jsx-boolean-value': 'warn',
			'react/jsx-curly-brace-presence': 'warn',
			'react/jsx-fragments': ['warn', 'element'],
			'react/jsx-no-useless-fragment': ['warn', { allowExpressions: true }],
			'react/jsx-sort-props': [
				'warn',
				{
					callbacksLast: true,
					shorthandFirst: true,
					noSortAlphabetically: true,
					reservedFirst: true,
				},
			],
			'react-hooks/exhaustive-deps': 'off',
			// typescript types
			'@typescript-eslint/ban-ts-comment': 'off',
			'@typescript-eslint/ban-types': 'off',
			'@typescript-eslint/consistent-type-exports': [
				'warn',
				{ fixMixedExportsWithInlineTypeSpecifier: true },
			],
			'@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
			'@typescript-eslint/no-empty-interface': ['warn', { allowSingleExtends: true }],
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-non-null-assertion': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
			// typescript extensions
			'@typescript-eslint/dot-notation': 'warn',
		},
	},
);
