import {
  Tree,
  addProjectConfiguration,
  ProjectConfiguration,
} from '@nx/devkit';
import { NormalizedSchema } from '../generator';

export default function addProjectConfigs(
  tree: Tree,
  options: NormalizedSchema
) {
  const appendCodebase =
    options.codebase && options.codebase !== 'default'
      ? `:${options.codebase}`
      : '';

  const projectConfiguration: ProjectConfiguration = {
    root: options.projectRoot,
    projectType: 'application',
    sourceRoot: `${options.projectRoot}/src`,
    tags: options.parsedTags,
    targets: {},
  };

  // Add lint target if linter is specified
  if (options.linter && options.linter !== 'none') {
    projectConfiguration.targets!.lint = {
      executor: 'nx:run-commands',
      options: {
        command:
          options.linter === 'ruff'
            ? `ruff check ${options.projectRoot}`
            : `pylint ${options.projectRoot}/src`,
        cwd: options.projectRoot,
      },
    };
  }

  // Add test target
  projectConfiguration.targets!.test = {
    executor: 'nx:run-commands',
    options: {
      command: 'pytest',
      cwd: options.projectRoot,
    },
  };

  // Add serve target (emulator)
  projectConfiguration.targets!.serve = {
    executor: 'nx:run-commands',
    options: {
      command: `firebase emulators:start --only functions${appendCodebase}`,
    },
  };

  // Add deploy target
  projectConfiguration.targets!.deploy = {
    executor: 'nx:run-commands',
    options: {
      command: `firebase deploy --only functions${appendCodebase}`,
    },
    dependsOn: ['test'],
  };

  addProjectConfiguration(tree, options.projectName, projectConfiguration);
}
