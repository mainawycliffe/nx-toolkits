import { addProjectConfiguration, Tree } from '@nrwl/devkit';
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
  const appendCodebase = codebase !== 'default' ? `:${codebase}` : '';

  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'application',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      lint: {
        executor: '@nrwl/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [`${normalizedOptions.projectRoot}/**/*.ts`],
          fix: true,
        },
      },
      // todo: will circle back to this later
      // serve: {
      //   executor: '@nx-toolkits/firebase:serve',
      // },
      build: {
        executor: '@nrwl/js:tsc',
        dependsOn: ['lint'],
        options: {
          outputPath: `dist/${normalizedOptions.projectRoot}`,
          tsConfig: `${normalizedOptions.projectRoot}/tsconfig.json`,
          main: `${normalizedOptions.projectDirectory}/src/index.ts`,
          buildableProjectDepsInPackageJsonType: 'dependencies', // use dependencies instead of peerDependencies
        },
      },
      watch: {
        executor: '@nrwl/js:tsc',
        dependsOn: ['lint'],
        options: {
          outputPath: `dist/${normalizedOptions.projectRoot}`,
          tsConfig: `${normalizedOptions.projectRoot}/tsconfig.json`,
          main: `${normalizedOptions.projectDirectory}/src/index.ts`,
          buildableProjectDepsInPackageJsonType: 'dependencies', // use dependencies instead of peerDependencies
          watch: true,
        },
      },
      deploy: {
        command: `firebase deploy --only functions${appendCodebase}`,
      },
    },
    tags: normalizedOptions.parsedTags,
  });
}
