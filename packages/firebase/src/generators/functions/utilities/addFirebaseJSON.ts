import { detectPackageManager, Tree, writeJson } from '@nx/devkit';
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
    codebase,
    ignore: [
      'node_modules',
      '.git',
      // As of now, Firebase functions doesn't support multiple package
      // managers, so let's not upload for deployment, as it will fail. If you
      // are using a different package manager, for now, you can configure
      // manually after generating the project.
      'package-lock.json',
      'pnpm-lock.yaml',
      'yarn.lock',
      'bun.lockb',
      'firebase-debug.log',
      'firebase-debug.*.log',
    ],
    predeploy: [
      // let's use the nx cli to run the linting and building, build depends on
      // lint, so we don't need to run lint first
      `${commandToRunNX} nx run ${options.projectName}:build`,
      "echo 'Functions built successfully.'",
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
