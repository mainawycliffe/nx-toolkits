import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration } from '@nrwl/devkit';

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

  it("should throw an error if firebase project isn't defined", async () => {
    await expect(generator(appTree, { ...options, firebaseProject: undefined }))
      .rejects.toThrowErrorMatchingInlineSnapshot(`
      "Firebase project has not been initialized.

      Please run firebase init first or provide the firebase project id (--firebase flag) as an option to the generator.

      You can find the firebase project id in the firebase console or by running firebase project:list.
      "
    `);
  });

  it('should run successfully if firebase project is defined', async () => {
    await generator(appTree, { ...options, firebaseProject: 'test' });
    const config = readProjectConfiguration(appTree, 'test');
    expect(config).toMatchInlineSnapshot(`
      Object {
        "$schema": "../node_modules/nx/schemas/project-schema.json",
        "name": "test",
        "projectType": "application",
        "root": "test",
        "sourceRoot": "./test/src",
        "tags": Array [],
        "targets": Object {
          "build": Object {
            "configurations": Object {
              "development": Object {
                "minify": false,
              },
              "production": Object {
                "minify": true,
              },
            },
            "defaultConfiguration": "production",
            "executor": "@nrwl/esbuild:esbuild",
            "options": Object {
              "assets": Array [],
              "dependenciesFieldType": "dependencies",
              "main": "./test/src/index.ts",
              "outputFileName": "index.js",
              "outputPath": "dist/./test",
              "platform": "node",
              "project": "./test/package.json",
              "thirdParty": false,
              "tsConfig": "./test/tsconfig.json",
            },
            "outputs": Array [
              "{options.outputPath}",
            ],
          },
          "deploy": Object {
            "command": "firebase deploy --only functions",
          },
          "lint": Object {
            "executor": "@nrwl/linter:eslint",
            "options": Object {
              "fix": true,
              "lintFilePatterns": Array [
                "./test/**/*.ts",
              ],
            },
            "outputs": Array [
              "{options.outputFile}",
            ],
          },
          "serve": Object {
            "command": "firebase emulators:start --only functions",
          },
          "test": Object {
            "executor": "@nrwl/jest:jest",
            "options": Object {
              "coverageDirectory": "coverage/./test",
              "jestConfig": "./test/jest.config.ts",
              "passWithNoTests": true,
            },
            "outputs": Array [
              "coverage/./test",
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
      '@nrwl/esbuild': expect.any(String),
      '@nrwl/jest': expect.any(String),
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
      Object {
        "$schema": "../node_modules/nx/schemas/project-schema.json",
        "name": "test",
        "projectType": "application",
        "root": "test",
        "sourceRoot": "./test/src",
        "tags": Array [],
        "targets": Object {
          "build": Object {
            "configurations": Object {
              "development": Object {
                "minify": false,
              },
              "production": Object {
                "minify": true,
              },
            },
            "defaultConfiguration": "production",
            "executor": "@nrwl/esbuild:esbuild",
            "options": Object {
              "assets": Array [],
              "dependenciesFieldType": "dependencies",
              "main": "./test/src/index.ts",
              "outputFileName": "index.js",
              "outputPath": "dist/./test",
              "platform": "node",
              "project": "./test/package.json",
              "thirdParty": false,
              "tsConfig": "./test/tsconfig.json",
            },
            "outputs": Array [
              "{options.outputPath}",
            ],
          },
          "deploy": Object {
            "command": "firebase deploy --only functions",
          },
          "lint": Object {
            "executor": "@nrwl/linter:eslint",
            "options": Object {
              "fix": true,
              "lintFilePatterns": Array [
                "./test/**/*.ts",
              ],
            },
            "outputs": Array [
              "{options.outputFile}",
            ],
          },
          "serve": Object {
            "command": "firebase emulators:start --only functions",
          },
          "test": Object {
            "executor": "@nrwl/jest:jest",
            "options": Object {
              "coverageDirectory": "coverage/./test",
              "jestConfig": "./test/jest.config.ts",
              "passWithNoTests": true,
            },
            "outputs": Array [
              "coverage/./test",
            ],
          },
        },
      }
    `);
  });
});
