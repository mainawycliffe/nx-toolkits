import {
  checkFilesExist,
  ensureNxProject,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nx/plugin/testing';

describe('firebase e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@nx-toolkits/firebase', 'dist/packages/firebase');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should generate functions app with correct config', async () => {
    const project = uniq('functions');
    await runNxCommandAsync(
      `generate @nx-toolkits/firebase:functions ${project}`
    );

    // Files should exist under apps/<project>
    expect(() =>
      checkFilesExist(
        `apps/${project}/src/index.ts`,
        `apps/${project}/jest.config.ts`
      )
    ).not.toThrow();

    // Project config should contain proper build target
    const projectJson = readJson(`apps/${project}/project.json`);
    expect(projectJson.targets.build.executor).toBe('@nx/esbuild:esbuild');
    expect(projectJson.targets.build.options.main).toBe(
      `apps/${project}/src/index.ts`
    );
    expect(projectJson.targets.build.options.outputPath).toBe(
      `dist/apps/${project}`
    );

    // firebase.json should be updated with default codebase entry
    const firebaseJson = readJson('firebase.json');
    const fnEntry = (firebaseJson.functions || []).find(
      (f: any) => f.codebase === 'default'
    );
    expect(fnEntry).toBeTruthy();
    expect(fnEntry.source).toBe(`dist/apps/${project}`);
    expect(fnEntry.predeploy).toContainEqual(
      expect.stringContaining(`nx run ${project}:build`)
    );
  }, 180000);

  describe('--directory', () => {
    it('should create project in the specified directory', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --directory subdir`
      );
      expect(() =>
        checkFilesExist(`apps/subdir/${project}/src/index.ts`)
      ).not.toThrow();
    }, 180000);
  });

  describe('--tags', () => {
    it('should add tags to the project', async () => {
      const projectName = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${projectName} --tags e2etag,e2ePackage`
      );
      const projectJson = readJson(`apps/${projectName}/project.json`);
      expect(projectJson.tags).toEqual(['e2etag', 'e2ePackage']);
    }, 180000);
  });

  describe('--codebase', () => {
    it('should set codebase in firebase.json and not duplicate entries', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --codebase api`
      );
      const firebaseJson = readJson('firebase.json');
      const entries = (firebaseJson.functions || []).filter(
        (f: any) => f.codebase === 'api'
      );
      expect(entries.length).toBe(1);
      expect(entries[0].source).toBe(`dist/apps/${project}`);
    }, 180000);
  });
});
