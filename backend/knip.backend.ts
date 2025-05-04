/** @type {import('knip').KnipConfig} */
module.exports = {
  ignore: ["**/node_modules/**", "**/dist/**"],
  entry: ["backend/src/index.ts"],
  project: ["backend/tsconfig.json"],
};
