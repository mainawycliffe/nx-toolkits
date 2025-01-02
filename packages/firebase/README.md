# @nx-toolkits/firebase

## Installation

First, install the generator:

```bash
npm install -D @nx-toolkits/firebase
```

## Firebase Functions

We generate a Firebase Functions app using the `@nx-toolkits/firebase:functions` and
connect it to the Firebase project using the `--project` option. This allows for
normal firebase cli commands to be used to work, as if it was an app generated
using firebase cli.

### Generate a Firebase Functions app

Use the generator to generate a Firebase Functions app:

```bash
nx g @nx-toolkits/firebase:functions
```

This will generate a Firebase Functions app in the `apps` folder.

#### Generator Options

| Option              | alias       | Description                                                                                                                                                                                       |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--name`            |             | The name of the nx app to create.                                                                                                                                                                 |
| `--firebaseProject` | `--project` | The Firebase project to connect to.                                                                                                                                                               |
| `--codebase`        |             | The codebase to use, allowing you to organize firebase functions according to your needs. Learn more [here](https://firebase.googlecom/docs/functions/organize-functions) about Firebase Codebase |
| `--nodeVersion`     |             | The runtime node version to use on firebase functions.                                                                                                                                            |
| `--directory`       |             | The directory to create the app in.                                                                                                                                                               |
| `--tags`            |             | Tags to add to the app.                                                                                                                                                                           |
| `--dry-run`         |             | Run through without making changes.                                                                                                                                                               |

### Deploy a Firebase Functions app

You can deploy a Firebase Functions app using the `nx run deploy` command:

```bash
nx run my-functions-app:deploy
```

The above with run linting, building, and then deploy the app to Firebase.

You can also use firebase cli to deploy the app, just like you would normally do:

```bash
firebase deploy --only functions
```

### Linting a Firebase Functions app

You can lint a Firebase Functions app using the `nx lint` command:

```bash
nx run my-functions-app:lint
```

### Building a Firebase Functions app

You can build a Firebase Functions app using the `nx build` command:

```bash
nx run my-functions-app:build
```
