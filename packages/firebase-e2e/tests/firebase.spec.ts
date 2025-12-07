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

  describe('--nodeVersion', () => {
    it('should set the node version in package.json', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --nodeVersion=18`
      );
      const packageJson = readJson(`apps/${project}/package.json`);
      expect(packageJson.engines.node).toBe('18');
    }, 180000);

    it('should default to node 20 when not specified', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project}`
      );
      const packageJson = readJson(`apps/${project}/package.json`);
      expect(packageJson.engines.node).toBe('20');
    }, 180000);
  });

  describe('--genkit', () => {
    it('should install Genkit dependencies when flag is enabled', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --genkit=true`
      );

      // Check that Genkit dependencies are installed
      const packageJson = readJson(`apps/${project}/package.json`);
      expect(packageJson.dependencies).toHaveProperty('genkit');
      expect(packageJson.dependencies).toHaveProperty(
        '@genkit-ai/google-genai'
      );
      expect(packageJson.dependencies).toHaveProperty('@genkit-ai/firebase');
      expect(packageJson.dependencies).toHaveProperty('zod');
      expect(packageJson.devDependencies).toHaveProperty('tsx');
    }, 180000);

    it('should add genkit-ui target when Genkit is enabled', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --genkit=true`
      );

      const projectJson = readJson(`apps/${project}/project.json`);
      expect(projectJson.targets).toHaveProperty('genkit-ui');
      expect(projectJson.targets['genkit-ui'].executor).toBe(
        '@nx-toolkits/firebase:genkit-ui'
      );
      expect(projectJson.targets['genkit-ui'].options.port).toBe(4000);
    }, 180000);

    it('should not install Genkit dependencies when flag is false', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --genkit=false`
      );

      const packageJson = readJson(`apps/${project}/package.json`);
      expect(packageJson.dependencies).not.toHaveProperty('genkit');
      expect(packageJson.dependencies).not.toHaveProperty(
        '@genkit-ai/google-genai'
      );
      expect(packageJson.devDependencies).not.toHaveProperty('tsx');
    }, 180000);

    it('should not add genkit-ui target when Genkit is disabled', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --genkit=false`
      );

      const projectJson = readJson(`apps/${project}/project.json`);
      expect(projectJson.targets).not.toHaveProperty('genkit-ui');
    }, 180000);
  });

  describe('project targets', () => {
    it('should create all required targets', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project}`
      );

      const projectJson = readJson(`apps/${project}/project.json`);

      // Required targets
      expect(projectJson.targets).toHaveProperty('lint');
      expect(projectJson.targets).toHaveProperty('test');
      expect(projectJson.targets).toHaveProperty('build');
      expect(projectJson.targets).toHaveProperty('serve');
      expect(projectJson.targets).toHaveProperty('deploy');

      // Lint target
      expect(projectJson.targets.lint.executor).toBe('@nx/eslint:lint');

      // Test target
      expect(projectJson.targets.test.executor).toBe('@nx/jest:jest');

      // Build target
      expect(projectJson.targets.build.executor).toBe('@nx/esbuild:esbuild');
      expect(projectJson.targets.build.options.generatePackageJson).toBe(true);
      expect(projectJson.targets.build.options.platform).toBe('node');

      // Serve target
      expect(projectJson.targets.serve.command).toContain(
        'firebase emulators:start --only functions'
      );

      // Deploy target
      expect(projectJson.targets.deploy.command).toContain(
        'firebase deploy --only functions'
      );
    }, 180000);

    it('should append codebase to serve and deploy commands when specified', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --codebase custom-api`
      );

      const projectJson = readJson(`apps/${project}/project.json`);

      expect(projectJson.targets.serve.command).toContain(':custom-api');
      expect(projectJson.targets.deploy.command).toContain(':custom-api');
    }, 180000);

    it('should not append codebase suffix for default codebase', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project} --codebase default`
      );

      const projectJson = readJson(`apps/${project}/project.json`);

      expect(projectJson.targets.serve.command).not.toContain(':default');
      expect(projectJson.targets.deploy.command).not.toContain(':default');
    }, 180000);
  });

  describe('file generation', () => {
    it('should generate all required files', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project}`
      );

      expect(() =>
        checkFilesExist(
          `apps/${project}/src/index.ts`,
          `apps/${project}/package.json`,
          `apps/${project}/tsconfig.json`,
          `apps/${project}/tsconfig.spec.json`,
          `apps/${project}/jest.config.ts`,
          `apps/${project}/eslint.config.mjs`,
          `apps/${project}/project.json`
        )
      ).not.toThrow();
    }, 180000);

    it('should create properly configured package.json', async () => {
      const project = uniq('functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project}`
      );

      const packageJson = readJson(`apps/${project}/package.json`);

      expect(packageJson.name).toBe(project);
      expect(packageJson.main).toBe('index.js');
      expect(packageJson.engines).toHaveProperty('node');
      expect(packageJson.dependencies).toHaveProperty('firebase-admin');
      expect(packageJson.dependencies).toHaveProperty('firebase-functions');
      expect(packageJson.devDependencies).toHaveProperty(
        'firebase-functions-test'
      );
    }, 180000);
  });

  describe('multiple projects', () => {
    it('should handle multiple functions projects with different codebases', async () => {
      const project1 = uniq('functions');
      const project2 = uniq('functions');

      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project1} --codebase api`
      );
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project2} --codebase admin`
      );

      const firebaseJson = readJson('firebase.json');
      const apiEntry = (firebaseJson.functions || []).find(
        (f: any) => f.codebase === 'api'
      );
      const adminEntry = (firebaseJson.functions || []).find(
        (f: any) => f.codebase === 'admin'
      );

      expect(apiEntry).toBeTruthy();
      expect(adminEntry).toBeTruthy();
      expect(apiEntry.source).toBe(`dist/apps/${project1}`);
      expect(adminEntry.source).toBe(`dist/apps/${project2}`);
    }, 180000);

    it('should handle multiple projects with Genkit enabled and disabled', async () => {
      const genkitProject = uniq('functions');
      const regularProject = uniq('functions');

      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${genkitProject} --genkit=true`
      );
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${regularProject} --genkit=false`
      );

      const genkitPackageJson = readJson(`apps/${genkitProject}/package.json`);
      const regularPackageJson = readJson(
        `apps/${regularProject}/package.json`
      );

      expect(genkitPackageJson.dependencies).toHaveProperty('genkit');
      expect(regularPackageJson.dependencies).not.toHaveProperty('genkit');
    }, 180000);
  });
});
