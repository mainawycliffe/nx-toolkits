import { Tree, updateProjectConfiguration } from '@nx/devkit';
import { NormalizedSchema } from '../schema';

export default function addDeployTarget(tree: Tree, options: NormalizedSchema) {
  const projectConfig = options.projectConfig;

  // Add deploy target
  projectConfig.targets = projectConfig.targets || {};
  projectConfig.targets.deploy = {
    executor: 'nx:run-commands',
    options: {
      command: `firebase deploy --only hosting:${options.siteName}`,
    },
    dependsOn: [options.buildTarget || 'build'],
  };

  // Update project configuration
  updateProjectConfiguration(tree, options.projectName, projectConfig);
}
