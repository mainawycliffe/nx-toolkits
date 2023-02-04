import {
  updateProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
  readProjectConfiguration,
} from '@nrwl/devkit';
import * as path from 'path';
import { HostingGeneratorSchema } from './schema';

interface NormalizedSchema extends HostingGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
}

function normalizeOptions(
  tree: Tree,
  options: HostingGeneratorSchema
): NormalizedSchema {
  const name = names(options.name).fileName;
  const projectDirectory = options.directory
    ? `${names(options.directory).fileName}/${name}`
    : name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;
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

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.name),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (tree: Tree, options: HostingGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  // find the project we want to setup hosting for
  // update the project configuration to add the hosting target
  // update firebase.json, to include the hosting config
  // NB: Firebase Hosting can support multiple sites, so we need to update the
  // firebase.json file accordingly and make sure the user can add multiple
  // sites to the same project
  // For SSR, we will need Firebase Functions

  const projectConfig = readProjectConfiguration(
    tree,
    normalizedOptions.projectName
  );

  const outputPath = projectConfig.targets.build.options.outputPath;

  // we add a deploy target to the project
  projectConfig.targets.deploy = {
    command: 'firebase deploy --only hosting',
    // always run the build target before deploying
    dependsOn: ['build'],
  };

  updateProjectConfiguration(
    tree,
    normalizedOptions.projectName,
    projectConfig
  );

  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
