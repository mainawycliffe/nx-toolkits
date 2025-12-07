# Nx Toolkits

This is a monorepo for the Nx toolkits. It contains the following toolkits:

- [@nx-toolkits/firebase](packages/firebase/README.md) - Generate Firebase
  Functions apps.
- [@nx-toolkits/testing-library](packages/testing-library/README.md) - Setup
  Testing Library for React and Angular.

## @nx-toolkits/firebase

This is a toolkit for generating Firebase apps - at the moment, only Firebase
Functions apps are supported, but I am working on expanding it to include
Firebase hosting.

### NX Functions Generator

We generate a Firebase Functions app using the `@nx-toolkits/firebase:functions` and
connect it to the Firebase project using the `--project` option. This allows for
normal firebase cli commands to be used to work, as if it was an app generated
using firebase cli.

#### Installation

Install the generator in an nx workspace:

```bash
npm install -D @nx-toolkits/firebase
```

#### Generate a Firebase Functions app

Use the generator to generate a Firebase Functions app:

```bash
nx g @nx-toolkits/firebase:functions
```

This will generate a Firebase Functions app in the `apps` folder.

#### Generator Options

| Option              | alias       | Description                                                                                                              |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------ |
| `--name`            |             | The name of the nx app to create.                                                                                        |
| `--firebaseProject` | `--project` | The Firebase project to connect to.                                                                                      |
| `--codebase`        |             | The codebase to use. Learn more about [Firebase Codebase](https://firebase.googlecom/docs/functions/organize-functions). |
| `--nodeVersion`     |             | The runtime node version to use on firebase functions (14, 16, 18, 20, or 22).                                           |
| `--genkit`          |             | Add Firebase Genkit support with developer UI and required dependencies.                                                 |
| `--directory`       |             | The directory to create the app in.                                                                                      |
| `--tags`            |             | Tags to add to the app.                                                                                                  |
| `--dry-run`         |             | Run through without making changes.                                                                                      |

#### Deploy a Firebase Functions app

You can deploy a Firebase Functions app using the `nx run deploy` command:

```bash
nx run my-functions-app:deploy
```

The above with run linting, building, and then deploy the app to Firebase.

You can also use firebase-tools to deploy the app:

```bash
firebase deploy --only functions
```

#### Linting a Firebase Functions app

You can lint a Firebase Functions app using the `nx run lint` command:

```bash
nx run my-functions-app:lint
```

#### Building a Firebase Functions app

You can build a Firebase Functions app using the `nx run build` command:

```bash
nx run my-functions-app:build
```

#### Firebase Genkit Support

Generate Firebase Functions with [Genkit](https://firebase.google.com/docs/genkit) support for building AI-powered applications:

```bash
nx g @nx-toolkits/firebase:functions --genkit
```

Launch the Genkit Developer UI:

```bash
nx run my-functions-app:genkit-ui
```

Learn more in the [package documentation](packages/firebase/README.md#firebase-genkit-support).

### Roadmap

- [x] Add support for Firebase functions
- [x] Add support for Firebase Genkit
- [ ] Add support for Firebase hosting
