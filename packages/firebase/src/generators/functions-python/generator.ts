import { formatFiles, names, Tree, workspaceLayout } from '@nx/devkit';
import { FirebaseFunctionsPythonGeneratorSchema } from './schema';
import addFiles from './utilities/addFiles';
import addFirebaseJSON from './utilities/addFirebaseJSON';
import addProjectConfigs from './utilities/addProjectConfigs';
import upsertFirebaseRC from './utilities/upsertFirebaseRC';

export interface NormalizedSchema
  extends FirebaseFunctionsPythonGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  pythonVersion: '310' | '311' | '312';
  linter: 'ruff' | 'pylint' | 'none';
}

function normalizeOptions(
  tree: Tree,
  options: FirebaseFunctionsPythonGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${workspaceLayout().appsDir}/${projectDirectory}`;
  const parsedTags = options.tags
    ? options.tags.split(',').map((s) => s.trim())
    : [];

  return {
    ...options,
    projectName,
    projectRoot,
    projectDirectory,
    parsedTags,
    pythonVersion: options.pythonVersion || '312',
    linter: options.linter || 'ruff',
    codebase: options.codebase || 'default',
  };
}

export default async function (
  tree: Tree,
  options: FirebaseFunctionsPythonGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  addProjectConfigs(tree, normalizedOptions);
  addFirebaseJSON(tree, normalizedOptions);
  upsertFirebaseRC(tree, normalizedOptions);
  addFiles(tree, normalizedOptions);

  await formatFiles(tree);

  return () => {
    console.log('\n✅ Firebase Python Functions app created successfully!');
    console.log('\nNext steps:');
    console.log('  1. Install Python dependencies:');
    console.log(
      `     cd ${normalizedOptions.projectRoot} && pip install -r requirements.txt -r requirements-dev.txt`
    );
    console.log('  2. Run tests:');
    console.log(`     nx test ${normalizedOptions.projectName}`);
    console.log('  3. Start the emulator:');
    console.log(`     nx serve ${normalizedOptions.projectName}`);
    console.log('  4. Deploy to Firebase:');
    console.log(`     nx deploy ${normalizedOptions.projectName}`);
    console.log(
      '\nLearn more: https://firebase.google.com/docs/functions/get-started-python'
    );
  };
}
