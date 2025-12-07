import { Tree, joinPathFragments } from '@nx/devkit';
import { NormalizedSchema } from '../generator';

interface FirebaseJSON {
  functions?: FirebaseFunction[];
}

interface FirebaseFunction {
  source: string;
  codebase?: string;
  runtime?: string;
  ignore?: string[];
}

export default function addFirebaseJSON(tree: Tree, options: NormalizedSchema) {
  const firebaseJSONPath = 'firebase.json';

  let firebaseJSON: FirebaseJSON = { functions: [] };

  if (tree.exists(firebaseJSONPath)) {
    const content = tree.read(firebaseJSONPath, 'utf-8');
    if (content) {
      firebaseJSON = JSON.parse(content);
    }
  }

  // Ensure functions array exists
  if (!firebaseJSON.functions) {
    firebaseJSON.functions = [];
  }

  // Convert to array if it's a single object
  if (!Array.isArray(firebaseJSON.functions)) {
    firebaseJSON.functions = [firebaseJSON.functions];
  }

  const pythonRuntime = `python${options.pythonVersion}`;

  // Check if this codebase already exists
  const existingIndex = firebaseJSON.functions.findIndex(
    (fn: FirebaseFunction) => fn.codebase === options.codebase
  );

  const functionConfig: FirebaseFunction = {
    source: options.projectRoot,
    codebase: options.codebase === 'default' ? undefined : options.codebase,
    runtime: pythonRuntime,
    ignore: [
      'venv',
      '.git',
      'firebase-debug.log',
      'firebase-debug.*.log',
      '**/__pycache__',
      '**/*.pyc',
      '.pytest_cache',
      '.coverage',
      'htmlcov',
    ],
  };

  if (existingIndex >= 0) {
    // Update existing configuration
    firebaseJSON.functions[existingIndex] = functionConfig;
  } else {
    // Add new configuration
    firebaseJSON.functions.push(functionConfig);
  }

  tree.write(firebaseJSONPath, JSON.stringify(firebaseJSON, null, 2));
}
