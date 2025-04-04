module.exports = {
  // Lint & Prettify TS and JS files
  '**/*.(ts|tsx|js)': filenames => [
    `npx prettier --write ${filenames.join(' ')}`,
    `npx eslint ${filenames.join(' ')}`,
  ],

  // Prettify only Markdown and JSON files
  '**/*.(md|json)': filenames => `npx prettier --write ${filenames.join(' ')}`,
};
