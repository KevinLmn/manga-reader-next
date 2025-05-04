/** @type {import('knip').KnipConfig} */
module.exports = {
  entry: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'features/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
  ],
  project: ['tsconfig.json'],
  ignore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.turbo/**'],
};
