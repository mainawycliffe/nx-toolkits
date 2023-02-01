import {
  addDependenciesToPackageJson,
  formatFiles,
  readProjectConfiguration,
  Tree,
  logger,
} from '@nrwl/devkit';
import { Framework, SetupGeneratorSchema } from './schema';

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

const frameworkSpecificDependencies: Record<
  Framework,
  Record<string, string>
> = {
  angular: {
    '@testing-library/angular': 'latest',
  },
  react: {
    '@testing-library/react': 'latest',
  },
  vue: {
    '@testing-library/vue': 'latest',
  },
  marko: {
    '@marko/testing-library': 'latest',
  },
  dom: {
    '@testing-library/dom': 'latest',
  },
  preact: {
    '@testing-library/preact': 'latest',
  },
};

export default async function (tree: Tree, options: SetupGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  logger.info(`Setting up testing-library for ${options.framework}`);

  // probably should read tsconfig.json and fetch the path to the test setup file
  const jestTestSetupFilename = `${normalizedOptions.projectRoot}/src/test-setup.ts`;

  // TODO: we need to modify not replace the file
  tree.write(jestTestSetupFilename, `import '@testing-library/jest-dom';`);

  addDependenciesToPackageJson(
    tree,
    {},
    {
      'jest-environment-jsdom': 'latest',
      '@types/testing-library__jest-dom': 'latest',
      '@testing-library/jest-dom': 'latest',
      ...frameworkSpecificDependencies[options.framework],
    }
  );

  await formatFiles(tree);
}
