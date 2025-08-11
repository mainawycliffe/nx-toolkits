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

  const firebaseJsonPath = 'firebase.json';
  const firebaseJsonContent = tree.read(firebaseJsonPath)?.toString();
  const existingFirebaseJson = firebaseJsonContent
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

  let updatedFunctionsArray: FirebaseFunctionConfigs;
  if (existingFirebaseJson && existingFirebaseJson.functions) {
    updatedFunctionsArray = [
      ...(existingFirebaseJson.functions as FirebaseFunctionConfigs).filter(
        (config) => config.codebase !== codebase
      ),
      firebaseFunctionConfig,
    ];
  } else {
    updatedFunctionsArray = [firebaseFunctionConfig];
  }

  let firebaseConfigs;
  if (existingFirebaseJson) {
    firebaseConfigs = {
      ...existingFirebaseJson,
      functions: updatedFunctionsArray,
    };
  } else {
    // firebase.json doesn't exist, create a default structure
    firebaseConfigs = {
      firestore: {
        rules: 'firestore.rules',
        indexes: 'firestore.indexes.json',
      },
      hosting: {
        public: 'public',
        ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
      },
      storage: {
        rules: 'storage.rules',
      },
      emulators: {
        auth: { port: 9099 },
        functions: { port: 5001 },
        firestore: { port: 8080 },
        database: { port: 9000 },
        hosting: { port: 5000 },
        pubsub: { port: 8085 },
        storage: { port: 9199 },
        ui: { enabled: true, port: 4000 },
      },
      functions: updatedFunctionsArray,
    };

    // Create placeholder files if they don't exist
    if (!tree.exists('firestore.rules')) {
      tree.write(
        'firestore.rules',
        `rules_version = '2';\n\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if false;\n    }\n  }\n}`
      );
    }
    if (!tree.exists('firestore.indexes.json')) {
      tree.write(
        'firestore.indexes.json',
        `{\n  "indexes": [],\n  "fieldOverrides": []\n}`
      );
    }
    if (!tree.exists('storage.rules')) {
      tree.write(
        'storage.rules',
        `rules_version = '2';\n\nservice firebase.storage {\n  match /b/{bucket}/o {\n    match /{allPaths=**} {\n      allow read, write: if false;\n    }\n  }\n}`
      );
    }
    if (!tree.exists('public/index.html')) {
      if (!tree.exists('public')) {
        // Ensure directory is created. Writing an empty file or a .gitkeep.
        // For simplicity, if public/index.html is being created, 'public' dir will be made.
        // If user wants an empty public dir initially, they can clear index.html or handle it.
      }
      tree.write(
        'public/index.html',
        `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Firebase Hosting</title>
  </head>
  <body>
    <h1>Welcome to Firebase Hosting</h1>
    <p>This is a placeholder page.</p>
  </body>
</html>`
      );
    }
  }

  writeJson(tree, firebaseJsonPath, firebaseConfigs);
}
