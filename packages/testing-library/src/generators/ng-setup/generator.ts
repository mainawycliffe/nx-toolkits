import {
  addDependenciesToPackageJson,
  formatFiles,
  readProjectConfiguration,
  Tree,
  logger,
} from '@nrwl/devkit';
import { SetupGeneratorSchema } from './schema';
import { tsquery } from '@phenomnomnominal/tsquery';
import { Node, SyntaxKind } from 'typescript';

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

  logger.info(`Setting up testing-library for an Angular project`);

  // probably should read tsconfig.json and fetch the path to the test setup file
  const jestTestSetupFilename = `${normalizedOptions.projectRoot}/src/test-setup.ts`;

  const jestTestSetupFile = tree.read(jestTestSetupFilename, 'utf-8');
  const ast = tsquery.ast(jestTestSetupFile);
  const nodes = tsquery(ast, 'ImportDeclaration');

  // check if the import already exists
  const importExists = nodes.some((node: Node) => {
    const importPath = node
      .getChildren()
      .filter((n) => {
        if (n.kind === SyntaxKind.StringLiteral) {
          return true;
        }
        return false;
      })
      .map((n) => n.getFullText())[0]
      .trim();

    if (importPath === `'@testing-library/jest-dom'`) {
      logger.warn(
        `@testing-library/jest-dom is already imported in ${jestTestSetupFilename}`
      );
      return true;
    }
  });

  if (!importExists) {
    // create a new import statement at the end of the list of other imports
    const newSetupFileContent = `${jestTestSetupFile.slice(
      0,
      nodes.at(-1).getEnd()
    )} import '@testing-library/jest-dom';${jestTestSetupFile.slice(
      nodes.at(-1).getEnd(),
      jestTestSetupFile.length
    )}`;

    tree.write(jestTestSetupFilename, newSetupFileContent);
  }

  addDependenciesToPackageJson(
    tree,
    {},
    {
      'jest-environment-jsdom': 'latest',
      '@types/testing-library__jest-dom': 'latest',
      '@testing-library/jest-dom': 'latest',
      '@testing-library/angular': 'latest',
    }
  );

  await formatFiles(tree);
}
