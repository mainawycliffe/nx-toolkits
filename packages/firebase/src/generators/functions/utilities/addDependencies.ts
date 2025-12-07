import { addDependenciesToPackageJson, Tree } from '@nx/devkit';
import { NormalizedSchema } from '../generator';

export default function addDependencies(
  tree: Tree,
  options?: NormalizedSchema
) {
  // get the version of @nx/workspace and use it for @nx/js
  const nxWorkspaceVersion = JSON.parse(tree.read('package.json').toString())
    .devDependencies['@nx/workspace'];

  const dependencies: Record<string, string> = {
    'firebase-admin': '^13.0.0',
    'firebase-functions': '^6.0.0',
    ...(options?.genkit && {
      genkit: 'latest',
      '@genkit-ai/google-genai': 'latest',
      '@genkit-ai/firebase': 'latest',
      zod: 'latest',
    }),
  };

  const devDependencies: Record<string, string> = {
    'firebase-functions-test': '^3.4.1',
    '@nx/esbuild': nxWorkspaceVersion || 'latest',
    '@nx/jest': nxWorkspaceVersion || 'latest',
    esbuild: '^0.22.0',
    ...(options?.genkit && {
      tsx: 'latest',
    }),
  };

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}
