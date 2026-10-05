import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import ts from 'typescript-eslint';
import react from 'eslint-plugin-react';
import hooks from 'eslint-plugin-react-hooks';
import a11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';
// Configure the maintained plugins directly: eslint-config-next currently pulls an unpatched braces dependency.
export default defineConfig([
  globalIgnores(['.next/**', '.open-next/**', '.wrangler/**', 'out/**', 'build/**', 'next-env.d.ts']),
  js.configs.recommended,
  ...ts.configs.recommended,
  { files: ['**/*.{js,mjs,ts,tsx}'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['**/*.tsx'], plugins: { react, 'react-hooks': hooks, 'jsx-a11y': a11y }, settings: { react: { version: 'detect' } },
    rules: { ...react.configs.recommended.rules, ...react.configs['jsx-runtime'].rules, ...hooks.configs.recommended.rules,
      'react/prop-types': 'off',
      'jsx-a11y/alt-text': ['error', { elements: ['img'], img: ['Image'] }],
      'jsx-a11y/aria-props': 'error', 'jsx-a11y/aria-proptypes': 'error', 'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error', 'jsx-a11y/role-supports-aria-props': 'error' } },
]);
