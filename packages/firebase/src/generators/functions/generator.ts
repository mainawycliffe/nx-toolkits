import { formatFiles, names, Tree, workspaceLayout } from '@nx/devkit';
import { FirebaseGeneratorSchema, FirebaseNodeRuntimeVersion } from './schema';
import addDependencies from './utilities/addDependencies';
import addFiles from './utilities/addFiles';
import addFirebaseJSON from './utilities/addFirebaseJSON';
import addProjectConfigs from './utilities/addProjectorConfigs';
import setupFirebaseProject from './utilities/upsertFirebaseRC';

export interface NormalizedSchema extends FirebaseGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
  nodeVersion: FirebaseNodeRuntimeVersion;
}

function normalizeOptions(
  tree: Tree,
  options: FirebaseGeneratorSchema
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
  };
}

export default async function (tree: Tree, options: FirebaseGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  if (!tree.exists('.firebaserc')) {
    setupFirebaseProject(tree, normalizedOptions);
  }

  addProjectConfigs(tree, normalizedOptions);
  addFirebaseJSON(tree, normalizedOptions);

  addFiles(tree, normalizedOptions);

  await formatFiles(tree);

  // add dependencies for firebase functions
  return addDependencies(tree);
}
