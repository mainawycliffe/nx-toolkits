import {
  addDependenciesToPackageJson,
  formatFiles,
  readProjectConfiguration,
  Tree,
  logger,
} from '@nx/devkit';
import { SetupGeneratorSchema } from './schema';
import {
  addJestDomImport,
  isJestSetupForProject,
} from '../../utils.ts/modifyFiles';

interface NormalizedSchema extends SetupGeneratorSchema {
  projectRoot: string;
}

function normalizeOptions(
  tree: Tree,
  options: SetupGeneratorSchema
): NormalizedSchema {
  const project = readProjectConfiguration(tree, options.project);
  const projectRoot = project.root;

  return {
    ...options,
    projectRoot,
  };
}

export default async function (tree: Tree, options: SetupGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  if (!isJestSetupForProject(tree, normalizedOptions)) {
    logger.warn(
      `Jest is not setup for project ${normalizedOptions.project}. Please run 'nx g @nx/jest:jest' first.`
    );
    return;
  }

  logger.info(`Setting up testing-library for an Angular project`);

  // probably should read tsconfig.json and fetch the path to the test setup file
  const jestTestSetupFilename = `${normalizedOptions.projectRoot}/src/test-setup.ts`;

  addJestDomImport(tree, jestTestSetupFilename);

  const install = addDependenciesToPackageJson(
    tree,
    {},
    {
      'jest-environment-jsdom': 'latest',
      '@types/testing-library__jest-dom': 'latest',
      '@testing-library/jest-dom': 'latest',
      '@testing-library/angular': 'latest',
    }
  );

  install();

  await formatFiles(tree);
}
