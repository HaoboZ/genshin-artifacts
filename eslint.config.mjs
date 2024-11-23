import eslint from '@eslint/js';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import globals from 'globals';
import typescript from 'typescript-eslint';

export default typescript.config(
	eslint.configs.recommended,
	react.configs.flat.recommended,
	react.configs.flat['jsx-runtime'],
	typescript.configs.recommended,
	prettier,
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 'latest',
				projectService: true,
				ecmaFeatures: { jsx: true },
				sourceType: 'module',
			},
			globals: { ...globals.browser, ...globals.node },
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
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-unused-vars': ['warn', { ignoreRestSiblings: true }],
			// typescript extensions
			'@typescript-eslint/dot-notation': 'warn',
		},
	},
);
