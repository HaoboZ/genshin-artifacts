import eslint from '@eslint/js';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';

export default tseslint.config(
	eslint.configs.recommended,
	...tseslint.configs.recommended,
	react.configs.flat['jsx-runtime'],
	prettierRecommended,
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				projectService: true,
				ecmaFeatures: { jsx: true },
				sourceType: 'module',
			},
		},
		rules: {
			// suggestions
			'dot-notation': 'off', // typescript
			'eqeqeq': 'warn',
			'no-empty': ['warn', { allowEmptyCatch: true }],
			'no-useless-computed-key': ['warn', { enforceForClassMembers: true }],
			'no-var': 'warn',
			// react
			'react/display-name': 'off',
			'react/function-component-definition': [
				'warn',
				{ namedComponents: 'function-declaration', unnamedComponents: 'arrow-function' },
			],
			'react/no-unescaped-entities': 'off',
			'react/prop-types': 'off',
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
			'@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
			// typescript extensions
			'@typescript-eslint/dot-notation': 'warn',
		},
	},
);
