import { addDependenciesToPackageJson, Tree } from '@nrwl/devkit';

export default function addDependencies(tree: Tree) {
  const installDependencies = addDependenciesToPackageJson(
    tree,
    {
      'firebase-admin': 'latest',
      'firebase-functions': 'latest',
    },
    {
      'firebase-functions-test': 'latest',
      '@nrwl/js:tsc': 'latest',
    }
  );

  // install all dependencies
  installDependencies();
}
