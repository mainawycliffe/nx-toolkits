import { addProjectConfiguration, Tree } from '@nx/devkit';
import { NormalizedSchema } from '../generator';

export default function addProjectConfigs(
  tree: Tree,
  normalizedOptions: NormalizedSchema
) {
  // As firebase allows you to organize your projects in codebases, we need to
  // append the codebase to the command, so that we can deploy the correct
  // functions only.
  // Docs: https://firebase.google.com/docs/functions/beta/organize-functions
  const { codebase } = normalizedOptions;
  const appendCodebase =
    codebase && codebase !== 'default' ? `:${codebase}` : '';

  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      lint: {
        executor: '@nx/eslint:lint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [`${normalizedOptions.projectRoot}/**/*.ts`],
          fix: true,
        },
      },
      test: {
        executor: '@nx/jest:jest',
        outputs: [`coverage/${normalizedOptions.projectRoot}`],
        options: {
          jestConfig: `${normalizedOptions.projectRoot}/jest.config.ts`,
          passWithNoTests: true,
          coverageDirectory: `coverage/${normalizedOptions.projectRoot}`,
        },
      },
      build: {
        executor: '@nx/esbuild:esbuild',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          main: `${normalizedOptions.projectRoot}/src/index.ts`,
          outputPath: `dist/${normalizedOptions.projectRoot}`,
          outputFileName: 'index.js',
          project: `${normalizedOptions.projectRoot}/package.json`,
          tsConfig: `${normalizedOptions.projectRoot}/tsconfig.json`,
          assets: [],
          platform: 'node',
          dependenciesFieldType: 'dependencies',
          // do not bundle npm dependencies
          thirdParty: false,
          // generate package.json file with dependencies
          generatePackageJson: true,
        },
        configurations: {
          development: {
            minify: false,
          },
          production: {
            minify: true,
          },
        },
      },
      watch: {
        executor: '@nx/esbuild:esbuild',
        outputs: ['{options.outputPath}'],
        defaultConfiguration: 'production',
        options: {
          main: `${normalizedOptions.projectRoot}/src/index.ts`,
          outputPath: `dist/${normalizedOptions.projectRoot}`,
          outputFileName: 'index.js',
          project: `${normalizedOptions.projectRoot}/package.json`,
          tsConfig: `${normalizedOptions.projectRoot}/tsconfig.json`,
          assets: [],
          platform: 'node',
          dependenciesFieldType: 'dependencies',
          // do not bundle npm dependencies
          thirdParty: false,
          // generate package.json file with dependencies
          generatePackageJson: true,
          watch: true
        },
        configurations: {
          development: {
            minify: false,
          },
          production: {
            minify: true,
          },
        },
      },
      serve: {
        command: `firebase emulators:start --only functions${appendCodebase}`,
      },
      deploy: {
        command: `firebase deploy --only functions${appendCodebase}`,
      },
    },
    tags: normalizedOptions.parsedTags,
  });
}
