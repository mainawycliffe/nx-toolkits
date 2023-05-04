import { logger, Tree } from '@nx/devkit';
import { tsquery } from '@phenomnomnominal/tsquery';
import { SyntaxKind } from 'typescript';
import { NormalizedSchema } from './ProjectNormalizedOptions';

export function getSetupFileContent(tree: Tree, setupFilePath: string): string {
  if (!tree.exists(setupFilePath)) {
    // create the file
    tree.write(setupFilePath, `import '@testing-library/jest-dom';`);
  }
  return tree.read(setupFilePath, 'utf-8');
}

export function addJestDomImport(tree: Tree, setupFilePath: string): void {
  const jestTestSetupFile = getSetupFileContent(tree, setupFilePath);
  const ast = tsquery.ast(jestTestSetupFile);
  const nodes = tsquery(ast, 'ImportDeclaration');

  // check if the import already exists
  const importExists = nodes.some((node) => {
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
        `@testing-library/jest-dom is already imported in ${setupFilePath}`
      );
      return true;
    }
  });

  if (!importExists) {
    // create a new import statement at the end of the list of other imports
    const lastImport = nodes[nodes.length - 1];
    const lastImportPos = lastImport.getEnd();
    const newImport = `import '@testing-library/jest-dom';`;
    const newContent = [
      jestTestSetupFile.slice(0, lastImportPos),
      newImport,
      jestTestSetupFile.slice(lastImportPos),
    ].join('');
    tree.write(setupFilePath, newContent);
  }
}

export function addSetupFileToJestConfig(
  tree: Tree,
  options: NormalizedSchema,
  setupFilePath: string
) {
  // for now, we assume that the jest config file is in the root of the project
  const jestConfigPath = `${options.projectRoot}/jest.config.ts`;
  const jestConfigFile = tree.read(jestConfigPath, 'utf-8');
  const ast = tsquery.ast(jestConfigFile);
  const nodes = tsquery(ast, 'PropertyAssignment');
  // add new file in setupFilesAfterEnv property of the jest config
  const setupFilesAfterEnv = nodes.find((node) =>
    node.getChildren().some((n) => n.getText() === 'setupFilesAfterEnv')
  );
  const setupFilePathWithoutProjectRoot = setupFilePath.replace(
    `${options.projectRoot}/`,
    '<rootDir>'
  );
  // if there are no setupFilesAfterEnv property, add it
  if (!setupFilesAfterEnv) {
    const lastProperty = nodes.at(-1);
    const lastPropertyPos = lastProperty.getEnd();
    logger.info(
      `Adding setupFilesAfterEnv property to ${jestConfigPath} with value ${setupFilePathWithoutProjectRoot}`
    );
    const newProperty = `, setupFilesAfterEnv: ['${setupFilePathWithoutProjectRoot}']`;
    const newContent = [
      jestConfigFile.slice(0, lastPropertyPos),
      newProperty,
      jestConfigFile.slice(lastPropertyPos),
    ].join('');
    tree.write(jestConfigPath, newContent);
  } else {
    // check if the setup file is already added
    const setupFileExists = setupFilesAfterEnv
      .getChildren()
      .some((n) =>
        n.getText().trim().includes(setupFilePathWithoutProjectRoot)
      );
    if (!setupFileExists) {
      const lastSetupFile = setupFilesAfterEnv
        .getChildren()
        .at(-1)
        .getChildren()
        .at(-2);
      // we are interested in the 2nd to last child of the last child of the
      // setupFilesAfterEnv property, since the last child is a square bracket "]"
      const beforeLastSetupFilePos = lastSetupFile.getEnd();
      const newSetupFile = `'${setupFilePathWithoutProjectRoot}'`;
      logger.info(
        `Adding ${setupFilePathWithoutProjectRoot} to setupFilesAfterEnv property of ${jestConfigPath}`
      );
      const newContent = [
        jestConfigFile.slice(0, beforeLastSetupFilePos),
        newSetupFile,
        jestConfigFile.slice(beforeLastSetupFilePos),
      ].join('');
      tree.write(jestConfigPath, newContent);
    }
  }
}

export function addSetupFileToTsConfig(
  tree: Tree,
  options: NormalizedSchema,
  setupFilePath: string
) {
  // for now, we assume that the tsconfig file is in the root of the project
  const tsConfigPath = `${options.projectRoot}/tsconfig.spec.json`;
  const tsConfigFile = tree.read(tsConfigPath, 'utf-8');
  const tsConfigJSON = JSON.parse(tsConfigFile);
  const setupFiles = tsConfigJSON?.files as string[];
  const pathFromRoot = setupFilePath.replace(`${options.projectRoot}/`, '');
  // if there are no files in the tsconfig, add the setup file
  if (!setupFiles) {
    tsConfigJSON.files = [pathFromRoot];
  } else {
    // check if the setup file is already added
    const setupFileExists = setupFiles.some((file) => file === pathFromRoot);
    if (!setupFileExists) {
      tsConfigJSON.files = [...setupFiles, pathFromRoot];
    }
  }
  tree.write(tsConfigPath, JSON.stringify(tsConfigJSON, null, 2));
}

// TODO: add support for other test runners such as Vitest
export function isJestSetupForProject(tree: Tree, options: NormalizedSchema) {
  const jestConfigPath = `${options.projectRoot}/jest.config.ts`;
  return tree.exists(jestConfigPath);
}
