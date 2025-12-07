import {
  Tree,
  readProjectConfiguration,
  formatFiles,
  logger,
} from '@nx/devkit';
import {
  FirebaseHostingGeneratorSchema,
  NormalizedSchema,
} from './schema';
import updateFirebaseJSON from './utilities/updateFirebaseJSON';
import addDeployTarget from './utilities/addDeployTarget';

function normalizeOptions(
  tree: Tree,
  options: FirebaseHostingGeneratorSchema
): NormalizedSchema {
  const projectConfig = readProjectConfiguration(tree, options.project);

  // Get build target configuration
  const buildTarget = options.buildTarget || 'build';
  const buildConfig = projectConfig.targets?.[buildTarget.split(':')[0]];

  if (!buildConfig) {
    throw new Error(
      `Build target not found for project ${options.project}. Please ensure the project has a build target.`
    );
  }

  // Extract output path from build configuration
  const outputPath =
    buildConfig.options?.outputPath ||
    buildConfig.options?.outputDir ||
    `dist/${projectConfig.root}`;

  // Use provided site name or default to project name
  const siteName = options.site || options.project;

  return {
    ...options,
    projectName: options.project,
    projectRoot: projectConfig.root,
    projectConfig,
    outputPath,
    siteName,
  };
}

export default async function (
  tree: Tree,
  options: FirebaseHostingGeneratorSchema
) {
  logger.warn(
    '⚠️  Firebase Hosting generator is EXPERIMENTAL and subject to change.'
  );

  // Validate SSR options
  if (options.ssr && !options.ssrFunction) {
    throw new Error(
      'When SSR is enabled, you must provide the --ssrFunction option with the name of your Cloud Function.'
    );
  }

  const normalizedOptions = normalizeOptions(tree, options);

  // Update firebase.json with hosting configuration
  updateFirebaseJSON(tree, normalizedOptions);

  // Add deploy target to project configuration
  addDeployTarget(tree, normalizedOptions);

  await formatFiles(tree);

  const ssrNote = options.ssr
    ? `\n⚠️  SSR is enabled. Make sure your Cloud Function "${options.ssrFunction}" is deployed first.`
    : '';

  logger.info(`
✅ Firebase Hosting configured for ${normalizedOptions.projectName}${ssrNote}

Next steps:
  1. Build your project: nx build ${normalizedOptions.projectName}${options.ssr ? `\n  2. Deploy your SSR function: nx deploy ${options.ssrFunction}` : ''}
  ${options.ssr ? '3' : '2'}. Deploy to Firebase Hosting: nx deploy ${normalizedOptions.projectName}

Note: This is an experimental feature. Please report any issues.
  `);
}
