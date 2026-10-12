import js from '@eslint/js';
import tseslint from 'typescript-eslint';
export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.turbo/**',
      '**/.vitepress/cache/**',
      '**/test-results/**',
      '**/playwright-report/**',
      '**/.artifacts/**',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
);
