import { Tree, writeJson } from '@nrwl/devkit';
import { NormalizedSchema } from '../generator';

type FirebaseFunctionConfig = {
  source: string;
  codebase: 'default' | string;
  ignore: string[];
  predeploy: string[];
};

type FirebaseFunctionConfigs = FirebaseFunctionConfig[];

export default function addFirebaseJSON(tree: Tree, options: NormalizedSchema) {
  const codebase = options.codebase || 'default';

  // connect to firebase, by modifying the firebase.json file
  // and point it to the new functions directory
  const firebaseJsonContent = tree.read('firebase.json')?.toString();
  const firebaseJson = firebaseJsonContent
    ? JSON.parse(firebaseJsonContent)
    : null;
  const functionsDirectory = `${options.projectRoot}/src`;
  const firebaseFunctionConfig: FirebaseFunctionConfig = {
    source: functionsDirectory,
    codebase,
    ignore: [
      'node_modules',
      '.git',
      'firebase-debug.log',
      'firebase-debug.*.log',
    ],
    predeploy: [
      // we are using nx to run the linting and building, so we will replace
      // this to use the nx cli
      // 'npm --prefix "$RESOURCE_DIR" run lint',
      // 'npm --prefix "$RESOURCE_DIR" run build',
    ],
  };

  const firebaseConfigs = {
    ...firebaseJson,
    // we are overwriting the functions config, because we don't want to add
    // multiple codebase configs, we won't delete the existing codebase, as it
    // might be wise to copy them over manually
    functions: [
      // make sure we don't add a duplicate codebase function config
      ...(firebaseJson && firebaseJson.functions
        ? (firebaseJson.functions as FirebaseFunctionConfigs).filter(
            (config) => config.codebase !== codebase
          )
        : []),
      firebaseFunctionConfig,
    ],
  };

  writeJson(tree, 'firebase.json', firebaseConfigs);
}
