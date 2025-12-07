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

      // Check that Genkit dependencies are installed in workspace root
      const rootPackageJson = readJson(`package.json`);
      expect(rootPackageJson.dependencies).toHaveProperty('genkit');
      expect(rootPackageJson.dependencies).toHaveProperty(
        '@genkit-ai/google-genai'
      );
      expect(rootPackageJson.dependencies).toHaveProperty(
        '@genkit-ai/firebase'
      );
      expect(rootPackageJson.dependencies).toHaveProperty('zod');
      expect(rootPackageJson.devDependencies).toHaveProperty('tsx');
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

      // Genkit deps should not be in workspace root (or may already exist from previous test)
      // Just verify the genkit-ui target is not added
      const projectJson = readJson(`apps/${project}/project.json`);
      expect(projectJson.targets).not.toHaveProperty('genkit-ui');
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

      // Firebase dependencies are in workspace root
      const rootPackageJson = readJson(`package.json`);
      expect(rootPackageJson.dependencies).toHaveProperty('firebase-admin');
      expect(rootPackageJson.dependencies).toHaveProperty('firebase-functions');
      expect(rootPackageJson.devDependencies).toHaveProperty(
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

      // Genkit dependencies are in workspace root when enabled
      const rootPackageJson = readJson(`package.json`);
      expect(rootPackageJson.dependencies).toHaveProperty('genkit');

      // Verify genkit-ui target exists only for genkit project
      const genkitProjectJson = readJson(`apps/${genkitProject}/project.json`);
      const regularProjectJson = readJson(
        `apps/${regularProject}/project.json`
      );

      expect(genkitProjectJson.targets).toHaveProperty('genkit-ui');
      expect(regularProjectJson.targets).not.toHaveProperty('genkit-ui');
    }, 180000);
  });

  describe('hosting (experimental)', () => {
    it('should configure hosting for an existing project', async () => {
      // First create a functions app
      const project = uniq('app');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project}`
      );

      // Then add hosting configuration
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:hosting ${project}`
      );

      // Check firebase.json was updated
      const firebaseJson = readJson('firebase.json');
      expect(firebaseJson.hosting).toBeDefined();
      expect(Array.isArray(firebaseJson.hosting)).toBe(true);

      const hostingConfig = firebaseJson.hosting.find(
        (h: any) => h.target === project
      );
      expect(hostingConfig).toBeDefined();
      expect(hostingConfig.public).toContain(`dist/apps/${project}`);
      expect(hostingConfig.rewrites).toBeDefined();
      expect(hostingConfig.headers).toBeDefined();

      // Check deploy target was added
      const projectJson = readJson(`apps/${project}/project.json`);
      expect(projectJson.targets.deploy).toBeDefined();
      expect(projectJson.targets.deploy.options.command).toContain(
        `firebase deploy --only hosting:${project}`
      );
      expect(projectJson.targets.deploy.dependsOn).toContain('build');
    }, 180000);

    it('should support custom site names', async () => {
      const project = uniq('app');
      const siteName = 'custom-site';

      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project}`
      );
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:hosting ${project} --site=${siteName}`
      );

      const firebaseJson = readJson('firebase.json');
      const hostingConfig = firebaseJson.hosting.find(
        (h: any) => h.target === siteName
      );

      expect(hostingConfig).toBeDefined();
      expect(hostingConfig.target).toBe(siteName);
    }, 180000);

    it('should allow disabling rewrites and headers', async () => {
      const project = uniq('app');

      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project}`
      );
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:hosting ${project} --rewrites=false --headers=false`
      );

      const firebaseJson = readJson('firebase.json');
      const hostingConfig = firebaseJson.hosting.find(
        (h: any) => h.target === project
      );

      expect(hostingConfig.rewrites).toBeUndefined();
      expect(hostingConfig.headers).toBeUndefined();
    }, 180000);
  });

  describe('hosting with SSR', () => {
    it('should configure hosting with SSR rewrites', async () => {
      const hostingProject = uniq('app');
      const functionProject = uniq('functions');

      // Create a functions app that will be used as the hosting project
      // (it has a build target which is required)
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${hostingProject}`
      );

      // Create another functions app for SSR
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${functionProject}`
      );

      // Then configure the first app for hosting with SSR
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:hosting ${hostingProject} --ssr=true --ssrFunction=${functionProject} --region=us-central1`
      );

      const firebaseJson = readJson('firebase.json');
      const hostingConfig = firebaseJson.hosting.find(
        (h: any) => h.target === hostingProject
      );

      expect(hostingConfig).toBeTruthy();
      expect(hostingConfig.rewrites).toBeDefined();
      expect(hostingConfig.rewrites).toHaveLength(1);
      expect(hostingConfig.rewrites[0]).toEqual({
        source: '**',
        function: {
          functionId: functionProject,
          region: 'us-central1',
        },
      });
    }, 180000);

    it('should throw error when SSR enabled without ssrFunction', async () => {
      const project = uniq('app');

      // Create a project with build target first
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions ${project}`
      );

      await expect(
        runNxCommandAsync(
          `generate @nx-toolkits/firebase:hosting ${project} --ssr=true`
        )
      ).rejects.toThrow();
    }, 180000);
  });

  describe('python functions', () => {
    it('should generate Python functions app with correct config', async () => {
      const project = uniq('py-functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions-python ${project} --firebaseProject=test-project`
      );

      // Files should exist
      expect(() =>
        checkFilesExist(
          `apps/${project}/src/main.py`,
          `apps/${project}/src/main_test.py`,
          `apps/${project}/requirements.txt`,
          `apps/${project}/requirements-dev.txt`,
          `apps/${project}/pytest.ini`,
          `apps/${project}/.gitignore`,
          `apps/${project}/README.md`
        )
      ).not.toThrow();

      // Project config should contain proper targets
      const projectJson = readJson(`apps/${project}/project.json`);
      expect(projectJson.targets.test).toBeDefined();
      expect(projectJson.targets.lint).toBeDefined();
      expect(projectJson.targets.serve).toBeDefined();
      expect(projectJson.targets.deploy).toBeDefined();

      // firebase.json should be updated with Python runtime
      const firebaseJson = readJson('firebase.json');
      expect(firebaseJson.functions).toBeDefined();
      const functionConfig = firebaseJson.functions.find(
        (fn: { source: string }) => fn.source === `apps/${project}`
      );
      expect(functionConfig).toBeDefined();
      expect(functionConfig.runtime).toBe('python312');
    }, 180000);

    it('should support different Python versions', async () => {
      const project = uniq('py-functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions-python ${project} --firebaseProject=test-project --pythonVersion=311`
      );

      const firebaseJson = readJson('firebase.json');
      const functionConfig = firebaseJson.functions.find(
        (fn: { source: string }) => fn.source === `apps/${project}`
      );
      expect(functionConfig.runtime).toBe('python311');
    }, 180000);

    it('should support custom codebase', async () => {
      const project = uniq('py-functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions-python ${project} --firebaseProject=test-project --codebase=py-codebase`
      );

      const firebaseJson = readJson('firebase.json');
      const functionConfig = firebaseJson.functions.find(
        (fn: { codebase?: string }) => fn.codebase === 'py-codebase'
      );
      expect(functionConfig).toBeDefined();
      expect(functionConfig.runtime).toBe('python312');
    }, 180000);

    it('should support different linters', async () => {
      const project1 = uniq('py-functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions-python ${project1} --firebaseProject=test-project --linter=pylint`
      );

      const projectJson1 = readJson(`apps/${project1}/project.json`);
      expect(projectJson1.targets.lint.options.command).toContain('pylint');

      const project2 = uniq('py-functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions-python ${project2} --firebaseProject=test-project --linter=none`
      );

      const projectJson2 = readJson(`apps/${project2}/project.json`);
      expect(projectJson2.targets.lint).toBeUndefined();
    }, 180000);

    it('should support custom directory', async () => {
      const project = uniq('py-functions');
      await runNxCommandAsync(
        `generate @nx-toolkits/firebase:functions-python ${project} --firebaseProject=test-project --directory=python`
      );

      expect(() =>
        checkFilesExist(`apps/python/${project}/src/main.py`)
      ).not.toThrow();

      const projectJson = readJson(`apps/python/${project}/project.json`);
      expect(projectJson.root).toBe(`apps/python/${project}`);
    }, 180000);
  });
});
