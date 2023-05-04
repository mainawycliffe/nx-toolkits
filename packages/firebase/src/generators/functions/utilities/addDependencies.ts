import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

export default function addDependencies(tree: Tree) {
  // get the version of @nx/workspace and use it for @nx/js
  const nxWorkspaceVersion = JSON.parse(tree.read('package.json').toString())
    .devDependencies['@nx/workspace'];

  return addDependenciesToPackageJson(
    tree,
    {
      'firebase-admin': '^11.4.1',
      'firebase-functions': '^4.1.1',
    },
    {
      'firebase-functions-test': '^3.0.0',
      '@nrwl/esbuild': nxWorkspaceVersion || 'latest',
      '@nx/jest': nxWorkspaceVersion || 'latest',
      esbuild: '^0.17.5',
    }
  );
}
