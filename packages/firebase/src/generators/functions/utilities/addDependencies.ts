import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';

export default function addDependencies(tree: Tree) {
  // get the version of @nrwl/workspace and use it for @nrwl/js
  const nxWorkspaceVersion = JSON.parse(tree.read('package.json').toString())
    .devDependencies['@nrwl/workspace'];

  const installDependencies = addDependenciesToPackageJson(
    tree,
    {
      'firebase-admin': 'latest',
      'firebase-functions': 'latest',
    },
    {
      'firebase-functions-test': 'latest',
      '@nrwl/js': nxWorkspaceVersion || 'latest',
    }
  );

  // install all dependencies
  installDependencies();
}
