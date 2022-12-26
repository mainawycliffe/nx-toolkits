import { detectPackageManager, Tree, writeJson } from '@nrwl/devkit';
import { NormalizedSchema } from '../generator';

type FirebaseFunctionConfig = {
  source: string;
  runtime: 'nodejs16' | 'nodejs14' | 'nodejs12' | 'nodejs18';
  codebase: 'default' | string;
  ignore: string[];
  predeploy: string[];
};

type FirebaseFunctionConfigs = FirebaseFunctionConfig[];

export default function addFirebaseJSON(tree: Tree, options: NormalizedSchema) {
  const codebase = options.codebase || 'default';

  const packageManager = detectPackageManager();
  const commandToRunNX = packageManager === 'npm' ? 'npx' : packageManager;

  // connect to firebase, by modifying the firebase.json file
  // and point it to the new functions directory
  const firebaseJsonContent = tree.read('firebase.json')?.toString();
  const firebaseJson = firebaseJsonContent
    ? JSON.parse(firebaseJsonContent)
    : null;
  const functionsDirectory = `dist/${options.projectRoot}`;
  const firebaseFunctionConfig: FirebaseFunctionConfig = {
    source: functionsDirectory,
    runtime: 'nodejs16',
    codebase,
    ignore: [
      'node_modules',
      '.git',
      'firebase-debug.log',
      'firebase-debug.*.log',
    ],
    predeploy: [
      // let's use the nx cli to run the linting and building, build depends on
      // lint, so we don't need to run lint first
      `${commandToRunNX} nx run ${options.projectName}:build`,
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
