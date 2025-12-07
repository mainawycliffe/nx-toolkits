import { Tree } from '@nx/devkit';
import { NormalizedSchema } from '../generator';

interface FirebaseRC {
  projects?: Record<string, string>;
}

export default function upsertFirebaseRC(
  tree: Tree,
  options: NormalizedSchema
) {
  const firebaseRCPath = '.firebaserc';

  let firebaseRC: FirebaseRC = {};

  if (tree.exists(firebaseRCPath)) {
    const content = tree.read(firebaseRCPath, 'utf-8');
    if (content) {
      firebaseRC = JSON.parse(content);
    }
  }

  // Ensure projects object exists
  if (!firebaseRC.projects) {
    firebaseRC.projects = {};
  }

  // Set the default project
  firebaseRC.projects['default'] = options.firebaseProject;

  tree.write(firebaseRCPath, JSON.stringify(firebaseRC, null, 2));
}
