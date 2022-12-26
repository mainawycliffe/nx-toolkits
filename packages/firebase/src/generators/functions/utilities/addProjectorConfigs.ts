import { addProjectConfiguration, Tree } from '@nrwl/devkit';
import { NormalizedSchema } from '../generator';

export default function addProjectConfigs(
  tree: Tree,
  normalizedOptions: NormalizedSchema
) {
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'library',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nrwl/js:tsc',
        options: {
          outputPath: `dist/${normalizedOptions.projectRoot}`,
          tsConfig: `${normalizedOptions.projectRoot}/src/tsconfig.json`,
        },
      },
      serve: {
        executor: '@nx-toolkits/firebase:serve',
      },
      deploy: {
        executor: '@nx-toolkits/firebase:deploy',
        dependsOn: ['build'],
      },
      lint: {
        executor: '@nrwl/linter:eslint',
        outputs: ['{options.outputFile}'],
        options: {
          lintFilePatterns: [`**/*.ts`],
          fix: true,
        },
      },
    },
    tags: normalizedOptions.parsedTags,
  });
}
