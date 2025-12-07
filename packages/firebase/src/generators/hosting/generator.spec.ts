import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readJson, readProjectConfiguration } from '@nx/devkit';
import generator from './generator';
import { FirebaseHostingGeneratorSchema } from './schema';

describe('hosting generator', () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();

    // Create a mock project with build target
    tree.write('apps/test-app/src/index.html', '<html></html>');
    tree.write(
      'apps/test-app/project.json',
      JSON.stringify({
        name: 'test-app',
        root: 'apps/test-app',
        sourceRoot: 'apps/test-app/src',
        targets: {
          build: {
            executor: '@angular-devkit/build-angular:browser',
            options: {
              outputPath: 'dist/apps/test-app',
              index: 'apps/test-app/src/index.html',
            },
          },
        },
      })
    );
  });

  it('should create firebase.json with hosting configuration', async () => {
    const options: FirebaseHostingGeneratorSchema = {
      project: 'test-app',
    };

    await generator(tree, options);

    expect(tree.exists('firebase.json')).toBeTruthy();
    const firebaseJson = readJson(tree, 'firebase.json');
    expect(firebaseJson.hosting).toBeDefined();
    expect(Array.isArray(firebaseJson.hosting)).toBe(true);
    expect(firebaseJson.hosting.length).toBeGreaterThan(0);
  });

  it('should add deploy target to project configuration', async () => {
    const options: FirebaseHostingGeneratorSchema = {
      project: 'test-app',
    };

    await generator(tree, options);

    const projectConfig = readProjectConfiguration(tree, 'test-app');
    expect(projectConfig.targets?.deploy).toBeDefined();
    expect(projectConfig.targets?.deploy?.executor).toBe('nx:run-commands');
    expect(projectConfig.targets?.deploy?.options?.command).toContain(
      'firebase deploy --only hosting'
    );
  });

  it('should use custom site name when provided', async () => {
    const options: FirebaseHostingGeneratorSchema = {
      project: 'test-app',
      site: 'my-custom-site',
    };

    await generator(tree, options);

    const firebaseJson = readJson(tree, 'firebase.json');
    const hostingConfig = firebaseJson.hosting.find(
      (h: { target: string }) => h.target === 'my-custom-site'
    );
    expect(hostingConfig).toBeTruthy();
  });

  it('should add SPA rewrites by default', async () => {
    const options: FirebaseHostingGeneratorSchema = {
      project: 'test-app',
    };

    await generator(tree, options);

    const firebaseJson = readJson(tree, 'firebase.json');
    const hostingConfig = firebaseJson.hosting[0];
    expect(hostingConfig.rewrites).toBeDefined();
    expect(hostingConfig.rewrites).toEqual([
      {
        source: '**',
        destination: '/index.html',
      },
    ]);
  });

  it('should add security headers by default', async () => {
    const options: FirebaseHostingGeneratorSchema = {
      project: 'test-app',
    };

    await generator(tree, options);

    const firebaseJson = readJson(tree, 'firebase.json');
    const hostingConfig = firebaseJson.hosting[0];
    expect(hostingConfig.headers).toBeDefined();
    expect(hostingConfig.headers.length).toBeGreaterThan(0);
  });

  it('should disable rewrites when rewrites=false', async () => {
    const options: FirebaseHostingGeneratorSchema = {
      project: 'test-app',
      rewrites: false,
    };

    await generator(tree, options);

    const firebaseJson = readJson(tree, 'firebase.json');
    const hostingConfig = firebaseJson.hosting[0];
    expect(hostingConfig.rewrites).toBeUndefined();
  });

  it('should disable headers when headers=false', async () => {
    const options: FirebaseHostingGeneratorSchema = {
      project: 'test-app',
      headers: false,
    };

    await generator(tree, options);

    const firebaseJson = readJson(tree, 'firebase.json');
    const hostingConfig = firebaseJson.hosting[0];
    expect(hostingConfig.headers).toBeUndefined();
  });

  describe('SSR support', () => {
    it('should configure SSR rewrites when ssr=true', async () => {
      const options: FirebaseHostingGeneratorSchema = {
        project: 'test-app',
        ssr: true,
        ssrFunction: 'my-ssr-function',
        region: 'us-central1',
      };

      await generator(tree, options);

      const firebaseJson = readJson(tree, 'firebase.json');
      const hostingConfig = firebaseJson.hosting[0];
      expect(hostingConfig.rewrites).toBeDefined();
      expect(hostingConfig.rewrites).toEqual([
        {
          source: '**',
          function: {
            functionId: 'my-ssr-function',
            region: 'us-central1',
          },
        },
      ]);
    });

    it('should throw error when ssr=true but ssrFunction is not provided', async () => {
      const options: FirebaseHostingGeneratorSchema = {
        project: 'test-app',
        ssr: true,
      };

      await expect(generator(tree, options)).rejects.toThrow(
        'When SSR is enabled, you must provide the --ssrFunction option'
      );
    });

    it('should use default region when not specified', async () => {
      const options: FirebaseHostingGeneratorSchema = {
        project: 'test-app',
        ssr: true,
        ssrFunction: 'my-ssr-function',
      };

      await generator(tree, options);

      const firebaseJson = readJson(tree, 'firebase.json');
      const hostingConfig = firebaseJson.hosting[0];
      expect(hostingConfig.rewrites[0].function.region).toBe('us-central1');
    });

    it('should prioritize SSR rewrites over SPA rewrites', async () => {
      const options: FirebaseHostingGeneratorSchema = {
        project: 'test-app',
        ssr: true,
        ssrFunction: 'my-ssr-function',
        rewrites: true, // Even with rewrites=true, SSR should take priority
      };

      await generator(tree, options);

      const firebaseJson = readJson(tree, 'firebase.json');
      const hostingConfig = firebaseJson.hosting[0];
      expect(hostingConfig.rewrites[0].function).toBeDefined();
      expect(hostingConfig.rewrites[0].destination).toBeUndefined();
    });
  });

  it('should throw error when project does not have build target', async () => {
    // Create project without build target
    tree.write(
      'apps/no-build/project.json',
      JSON.stringify({
        name: 'no-build',
        root: 'apps/no-build',
        targets: {},
      })
    );

    const options: FirebaseHostingGeneratorSchema = {
      project: 'no-build',
    };

    await expect(generator(tree, options)).rejects.toThrow(
      'Build target not found for project no-build'
    );
  });

  it('should update existing hosting configuration', async () => {
    // Create initial hosting config
    tree.write(
      'firebase.json',
      JSON.stringify({
        hosting: [
          {
            target: 'test-app',
            public: 'old-path',
          },
        ],
      })
    );

    const options: FirebaseHostingGeneratorSchema = {
      project: 'test-app',
    };

    await generator(tree, options);

    const firebaseJson = readJson(tree, 'firebase.json');
    expect(firebaseJson.hosting.length).toBe(1);
    expect(firebaseJson.hosting[0].public).toBe('dist/apps/test-app');
  });
});
