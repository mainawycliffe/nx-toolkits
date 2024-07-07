import { Tree, generateFiles, names, offsetFromRoot } from '@nx/devkit';
import { NormalizedSchema } from '../generator';
import path = require('path');

export default function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
    baseTsConfigFile:
      options.projectRoot
        .split('/')
        .map(() => '..')
        .join('/') + '/tsconfig.base.json',
  };

  const filesDir = options.runtime === 'python' ? 'files_python' : 'files';

  generateFiles(
    tree,
    path.join(__dirname, `../${filesDir}`),
    options.projectRoot,
    templateOptions
  );
}
