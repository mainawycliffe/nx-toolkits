import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';

export default function addDependencies(tree: Tree) {
  // get the version of @nrwl/workspace and use it for @nrwl/js
  const nxWorkspaceVersion = JSON.parse(tree.read('package.json').toString())
    .devDependencies['@nrwl/workspace'];

  const installDependencies = addDependenciesToPackageJson(
    tree,
    {
      'firebase-admin': '^11.4.1',
      'firebase-functions': '^4.1.1',
    },
    {
      'firebase-functions-test': '^3.0.0',
      '@nrwl/esbuild': nxWorkspaceVersion || 'latest',
      esbuild: '^0.15.7',
    }
  );

  // install all dependencies
  installDependencies();
}
