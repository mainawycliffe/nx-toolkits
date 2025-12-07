import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration } from '@nx/devkit';

import generator from './generator';
import { FirebaseFunctionsPythonGeneratorSchema } from './schema';

describe('functions-python generator', () => {
  let appTree: Tree;
  const options: FirebaseFunctionsPythonGeneratorSchema = {
    name: 'test',
    firebaseProject: 'test-project',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toBeDefined();
  });

  it('should create all required files', async () => {
    await generator(appTree, options);

    expect(appTree.exists('apps/test/src/main.py')).toBeTruthy();
    expect(appTree.exists('apps/test/src/main_test.py')).toBeTruthy();
    expect(appTree.exists('apps/test/requirements.txt')).toBeTruthy();
    expect(appTree.exists('apps/test/requirements-dev.txt')).toBeTruthy();
    expect(appTree.exists('apps/test/pytest.ini')).toBeTruthy();
    expect(appTree.exists('apps/test/.gitignore')).toBeTruthy();
    expect(appTree.exists('apps/test/README.md')).toBeTruthy();
  });

  it('should configure firebase.json with Python runtime', async () => {
    await generator(appTree, { ...options, pythonVersion: '312' });

    const firebaseJson = JSON.parse(appTree.read('firebase.json', 'utf-8')!);
    expect(firebaseJson.functions).toBeDefined();
    expect(firebaseJson.functions[0].runtime).toBe('python312');
  });

  it('should configure .firebaserc', async () => {
    await generator(appTree, options);

    const firebaseRC = JSON.parse(appTree.read('.firebaserc', 'utf-8')!);
    expect(firebaseRC.projects.default).toBe('test-project');
  });

  it('should add project configuration with targets', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');

    expect(config.targets?.lint).toBeDefined();
    expect(config.targets?.test).toBeDefined();
    expect(config.targets?.serve).toBeDefined();
    expect(config.targets?.deploy).toBeDefined();
  });

  it('should support custom directory', async () => {
    await generator(appTree, { ...options, directory: 'subdir' });
    const config = readProjectConfiguration(appTree, 'subdir-test');

    expect(config.root).toBe('apps/subdir/test');
  });

  it('should support custom codebase', async () => {
    await generator(appTree, { ...options, codebase: 'my-codebase' });

    const firebaseJson = JSON.parse(appTree.read('firebase.json', 'utf-8')!);
    expect(firebaseJson.functions[0].codebase).toBe('my-codebase');
  });

  it('should support different Python versions', async () => {
    await generator(appTree, { ...options, pythonVersion: '311' });

    const firebaseJson = JSON.parse(appTree.read('firebase.json', 'utf-8')!);
    expect(firebaseJson.functions[0].runtime).toBe('python311');
  });

  it('should add tags to project', async () => {
    await generator(appTree, { ...options, tags: 'backend,python' });
    const config = readProjectConfiguration(appTree, 'test');

    expect(config.tags).toEqual(['backend', 'python']);
  });

  it('should configure ruff linter by default', async () => {
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');

    expect(config.targets?.lint?.options?.command).toContain('ruff');
  });

  it('should support pylint linter', async () => {
    await generator(appTree, { ...options, linter: 'pylint' });
    const config = readProjectConfiguration(appTree, 'test');

    expect(config.targets?.lint?.options?.command).toContain('pylint');
  });

  it('should support no linter', async () => {
    await generator(appTree, { ...options, linter: 'none' });
    const config = readProjectConfiguration(appTree, 'test');

    expect(config.targets?.lint).toBeUndefined();
  });

  it('should not duplicate codebase in firebase.json', async () => {
    await generator(appTree, { ...options, codebase: 'test-codebase' });
    await generator(appTree, {
      name: 'test2',
      firebaseProject: 'test-project',
      codebase: 'test-codebase',
    });

    const firebaseJson = JSON.parse(appTree.read('firebase.json', 'utf-8')!);
    const testCodebases = firebaseJson.functions.filter(
      (fn: { codebase?: string }) => fn.codebase === 'test-codebase'
    );

    expect(testCodebases.length).toBe(1);
  });
});
