import { Tree, names, offsetFromRoot, generateFiles } from '@nrwl/devkit';
import path = require('path');
import { NormalizedSchema } from '../generator';

export default function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, '../files'),
    options.projectRoot,
    templateOptions
  );
}
