import { Tree, readProjectConfiguration } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

import generator from './generator';
import { FirebaseGeneratorSchema } from './schema';

describe('firebase generator', () => {
  let appTree: Tree;
  const options: FirebaseGeneratorSchema = {
    name: 'test',
    nodeVersion: '16',
  };

  beforeEach(() => {
    appTree = createTreeWithEmptyWorkspace();
  });

  it('should run successfully if firebase project is defined', async () => {
    await generator(appTree, { ...options });
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toMatchInlineSnapshot(`
      {
        "$schema": "../../node_modules/nx/schemas/project-schema.json",
        "name": "test",
        "projectType": "application",
        "root": "apps/test",
        "sourceRoot": "apps/test/src",
        "tags": [],
        "targets": {
          "build": {
            "configurations": {
              "development": {
                "minify": false,
              },
              "production": {
                "minify": true,
              },
            },
            "defaultConfiguration": "production",
            "executor": "@nx/esbuild:esbuild",
            "options": {
              "assets": [],
              "generatePackageJson": true,
              "main": "apps/test/src/index.ts",
              "outputFileName": "index.js",
              "outputPath": "dist/apps/test",
              "platform": "node",
              "tsConfig": "apps/test/tsconfig.json",
            },
            "outputs": [
              "{options.outputPath}",
            ],
          },
          "deploy": {
            "command": "firebase deploy --only functions",
          },
          "lint": {
            "executor": "@nx/eslint:lint",
            "options": {
              "fix": true,
              "lintFilePatterns": [
                "apps/test/**/*.ts",
              ],
            },
            "outputs": [
              "{options.outputFile}",
            ],
          },
          "serve": {
            "command": "firebase emulators:start --only functions",
          },
          "test": {
            "executor": "@nx/jest:jest",
            "options": {
              "coverageDirectory": "coverage/apps/test",
              "jestConfig": "apps/test/jest.config.ts",
              "passWithNoTests": true,
            },
            "outputs": [
              "coverage/apps/test",
            ],
          },
        },
      }
    `);
  });

  it('should have firebase and esbuild dependencies in package.json', async () => {
    appTree.write(
      '.firebaserc',
      JSON.stringify({ projects: { default: 'test' } })
    );
    await generator(appTree, options);
    const packageJson = JSON.parse(appTree.read('package.json').toString());

    expect(packageJson.dependencies).toStrictEqual({
      'firebase-admin': expect.any(String),
      'firebase-functions': expect.any(String),
    });

    expect(packageJson.devDependencies).toStrictEqual({
      esbuild: expect.any(String),
      'firebase-functions-test': expect.any(String),
      '@nx/esbuild': expect.any(String),
      '@nx/jest': expect.any(String),
    });
  });

  it('should run successfully if project has been initialized', async () => {
    appTree.write(
      '.firebaserc',
      JSON.stringify({ projects: { default: 'test' } })
    );
    await generator(appTree, options);
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toMatchInlineSnapshot(`
      {
        "$schema": "../../node_modules/nx/schemas/project-schema.json",
        "name": "test",
        "projectType": "application",
        "root": "apps/test",
        "sourceRoot": "apps/test/src",
        "tags": [],
        "targets": {
          "build": {
            "configurations": {
              "development": {
                "minify": false,
              },
              "production": {
                "minify": true,
              },
            },
            "defaultConfiguration": "production",
            "executor": "@nx/esbuild:esbuild",
            "options": {
              "assets": [],
              "generatePackageJson": true,
              "main": "apps/test/src/index.ts",
              "outputFileName": "index.js",
              "outputPath": "dist/apps/test",
              "platform": "node",
              "tsConfig": "apps/test/tsconfig.json",
            },
            "outputs": [
              "{options.outputPath}",
            ],
          },
          "deploy": {
            "command": "firebase deploy --only functions",
          },
          "lint": {
            "executor": "@nx/eslint:lint",
            "options": {
              "fix": true,
              "lintFilePatterns": [
                "apps/test/**/*.ts",
              ],
            },
            "outputs": [
              "{options.outputFile}",
            ],
          },
          "serve": {
            "command": "firebase emulators:start --only functions",
          },
          "test": {
            "executor": "@nx/jest:jest",
            "options": {
              "coverageDirectory": "coverage/apps/test",
              "jestConfig": "apps/test/jest.config.ts",
              "passWithNoTests": true,
            },
            "outputs": [
              "coverage/apps/test",
            ],
          },
        },
      }
    `);
  });
});
