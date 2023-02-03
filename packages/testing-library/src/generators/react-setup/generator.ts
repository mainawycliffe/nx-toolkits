import {
  addDependenciesToPackageJson,
  formatFiles,
  readProjectConfiguration,
  Tree,
  logger,
} from '@nrwl/devkit';
import { ReactSetupGeneratorSchema } from './schema';
import {
  addJestDomImport,
  addSetupFileToJestConfig,
  addSetupFileToTsConfig,
  isJestSetupForProject,
} from '../../utils.ts/modifyFiles';
import { NormalizedSchema } from '../../utils.ts/ProjectNormalizedOptions';

function normalizeOptions(
  tree: Tree,
  options: ReactSetupGeneratorSchema
): NormalizedSchema {
  const project = readProjectConfiguration(tree, options.project);
  const projectRoot = project.root;

  return {
    ...options,
    projectRoot,
  };
}

export default async function (tree: Tree, options: ReactSetupGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  if (!isJestSetupForProject(tree, normalizedOptions)) {
    logger.warn(
      `Jest is not setup for project ${normalizedOptions.project}. Please run 'nx g @nrwl/jest:jest' first.`
    );
    return;
  }

  logger.info(`Setting up testing-library for an React project`);

  // probably should read tsconfig.json and fetch the path to the test setup file
  const jestTestSetupFilename = `${normalizedOptions.projectRoot}/src/test-setup.ts`;

  addJestDomImport(tree, jestTestSetupFilename);
  addSetupFileToJestConfig(tree, normalizedOptions, jestTestSetupFilename);
  addSetupFileToTsConfig(tree, normalizedOptions, jestTestSetupFilename);

  addDependenciesToPackageJson(
    tree,
    {},
    {
      'jest-environment-jsdom': 'latest',
      '@types/testing-library__jest-dom': 'latest',
      '@testing-library/jest-dom': 'latest',
      '@testing-library/react': 'latest',
    }
  );

  await formatFiles(tree);
}
