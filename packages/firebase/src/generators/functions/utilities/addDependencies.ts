import { addDependenciesToPackageJson, Tree } from '@nx/devkit';

export default function addDependencies(tree: Tree) {
  // get the version of @nx/workspace and use it for @nx/js
  const nxWorkspaceVersion = JSON.parse(tree.read('package.json').toString())
    .devDependencies['@nx/workspace'];

  return addDependenciesToPackageJson(
    tree,
    {
      'firebase-admin': '^13.0.0',
      'firebase-functions': '^6.0.0',
    },
    {
      'firebase-functions-test': '^3.4.2',
      '@nx/esbuild': nxWorkspaceVersion || 'latest',
      '@nx/jest': nxWorkspaceVersion || 'latest',
      esbuild: '^0.22.0',
    }
  );
}
