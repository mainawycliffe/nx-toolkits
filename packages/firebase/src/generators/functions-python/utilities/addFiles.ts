import { Tree, generateFiles, joinPathFragments } from '@nx/devkit';
import { NormalizedSchema } from '../generator';
import * as path from 'path';

export default function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    template: '',
  };

  generateFiles(
    tree,
    path.join(__dirname, '..', 'files'),
    options.projectRoot,
    templateOptions
  );
}
