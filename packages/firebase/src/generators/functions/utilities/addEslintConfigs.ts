import { joinPathFragments, Tree, writeJson } from '@nrwl/devkit';
import { NormalizedSchema } from '../generator';

export default function addEslintConfigs(
  tree: Tree,
  options: NormalizedSchema
) {
  const eslint = {
    root: true,
    env: {
      es6: true,
      node: true,
    },
    extends: ['../../.eslintrc.json'],
    ignorePatterns: ['!**/*'],
    overrides: [
      {
        files: ['*.ts'],
        rules: {},
      },
      {
        files: ['./package.json', './generators.json', './executors.json'],
        parser: 'jsonc-eslint-parser',
        rules: {
          '@nrwl/nx/nx-plugin-checks': 'error',
        },
      },
    ],
  };
  writeJson(
    tree,
    joinPathFragments(options.projectRoot, '.eslintrc.json'),
    eslint
  );
}
