import { Tree, writeJson } from '@nx/devkit';
import { NormalizedSchema } from '../generator';

export default function upsertFirebaseRC(
  tree: Tree,
  options: NormalizedSchema
) {
  // running firebase list to list all firebase projects and let the user choose
  // the project to connect to is not possible, because the firebase cli doesn't
  // support outputting the list of projects in a machine readable format. We
  // will request to provide the project id as an option to the generator or to
  // initialize the firebase project first (without functions).

  // if the firebase.json or .firebaserc file is missing, we assume that the
  // firebase project has not been initialized yet. We will use the firebase
  // project id provided as an option to the generator and create a
  // .firebaserc
  const firebaseProjectId = options.firebaseProject;
  if (!firebaseProjectId) {
    throw new Error(
      `Firebase project has not been initialized.

Please run firebase init first or provide the firebase project id (--firebase flag) as an option to the generator.

You can find the firebase project id in the firebase console or by running firebase project:list.
`
    );
  }

  const firebaseConfigJSON = {
    projects: {
      default: firebaseProjectId,
      // aliases can be used to connect to different firebase projects but
      // this should be done using the firebase cli
    },
  };

  // create .firebaserc file
  writeJson(tree, '.firebaserc', firebaseConfigJSON);
}
