import { Tree, generateFiles, names, offsetFromRoot } from '@nx/devkit';
import { NormalizedSchema } from '../generator';
import path = require('path');

export default function addFiles(tree: Tree, options: NormalizedSchema) {
  const rootOffsetPath = offsetFromRoot(options.projectRoot);
  const templateOptions = {
    ...options,
    ...names(options.name),
    nodeVersion: String(options.nodeVersion),
    offsetFromRoot: rootOffsetPath,
    template: '',
    baseTsConfigFile: path.join(rootOffsetPath, '/tsconfig.base.json'),
  };

  generateFiles(
    tree,
    path.join(__dirname, '../files'),
    options.projectRoot,
    templateOptions
  );
}
