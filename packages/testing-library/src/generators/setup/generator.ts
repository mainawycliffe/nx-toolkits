import {
  addDependenciesToPackageJson,
  formatFiles,
  readProjectConfiguration,
  Tree,
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

  const jestTestSetupFilename = `${normalizedOptions.projectRoot}/src/test-setup.ts`;

  tree.write(jestTestSetupFilename, `import '@testing-library/jest-dom';`);

  addDependenciesToPackageJson(
    tree,
    {},
    {
      'jest-environment-jsdom': 'latest',
      ...frameworkSpecificDependencies[options.framework],
    }
  );

  await formatFiles(tree);
}
