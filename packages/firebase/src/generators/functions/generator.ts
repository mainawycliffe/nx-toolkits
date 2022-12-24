import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { FirebaseGeneratorSchema } from './schema';

type FirebaseFunctionConfig = {
  source: string;
  codebase: 'default' | string;
  ignore: string[];
  predeploy: string[];
};

type FirebaseFunctionConfigs = FirebaseFunctionConfig[];

interface NormalizedSchema extends FirebaseGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
  parsedTags: string[];
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

export default async function (tree: Tree, options: FirebaseGeneratorSchema) {
  // running firebase list to list all firebase projects and let the user choose
  // the project to connect to is not possible, because the firebase cli doesn't
  // support outputting the list of projects in a machine readable format. We
  // will request to provide the project id as an option to the generator or to
  // initialize the firebase project first (without functions).

  if (!tree.exists('.firebaserc')) {
    // if the firebase.json or .firebaserc file is missing, we assume that the
    // firebase project has not been initialized yet. We will use the firebase
    // project id provided as an option to the generator and create a
    // .firebaserc
    const firebaseProjectId = options.firebaseProject;
    if (!firebaseProjectId) {
      throw new Error(
        `Firebase project has not been initialized.

Please run firebase init first or provide the firebase project id (--firebase flag) as an option to the generator.

You can find the firebase project id in the firebase console or by running firebase project:list.
`
      );
    }

    const firebaseRCJSON = {
      projects: {
        default: firebaseProjectId,
        // aliases can be used to connect to different firebase projects but
        // this should be done using the firebase cli
      },
    };

    // create .firebaserc file
    tree.write('.firebaserc', JSON.stringify(firebaseRCJSON, null, 2));
  }

  const normalizedOptions = normalizeOptions(tree, options);

  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'library',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@nx-toolkit/firebase:build',
      },
      serve: {
        executor: '@nx-toolkit/firebase:serve',
      },
      deploy: {
        executor: '@nx-toolkit/firebase:deploy',
      },
      lint: {
        executor: '@nx-toolkit/firebase:lint',
      },
      logs: {
        executor: '@nx-toolkit/firebase:logs',
      },
      start: {
        executor: '@nx-toolkit/firebase:serve',
      },
      shell: {
        executor: '@nx-toolkit/firebase:shell',
      },
    },
    tags: normalizedOptions.parsedTags,
  });
  addFiles(tree, normalizedOptions);

  const codebase = options.codebase || 'default';

  // connect to firebase, by modifying the firebase.json file
  // and point it to the new functions directory
  const firebaseJsonContent = tree.read('firebase.json')?.toString();
  const firebaseJson = firebaseJsonContent
    ? JSON.parse(firebaseJsonContent)
    : null;
  const functionsDirectory = `${normalizedOptions.projectRoot}/src`;
  const firebaseFunctionConfig: FirebaseFunctionConfig = {
    source: functionsDirectory,
    codebase,
    ignore: [
      'node_modules',
      '.git',
      'firebase-debug.log',
      'firebase-debug.*.log',
    ],
    predeploy: [
      'npm --prefix "$RESOURCE_DIR" run lint',
      'npm --prefix "$RESOURCE_DIR" run build',
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

  tree.write('firebase.json', JSON.stringify(firebaseConfigs, null, 2));
  await formatFiles(tree);

  // install dependencies
  const installDependencies = addDependenciesToPackageJson(
    tree,
    {
      'firebase-admin': 'latest',
      'firebase-functions': 'latest',
    },
    {
      'firebase-functions-test': 'latest',
    }
  );

  // install dev dependencies
  await installDependencies();
}
