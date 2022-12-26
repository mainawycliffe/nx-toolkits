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

### Deploy a Firebase Functions app

You can deploy a Firebase Functions app using the `nx run deploy` command:

```bash
nx run my-functions-app:deploy
```

The above with run linting, building, and then deploy the app to Firebase.

You can also use firebase-tools to deploy the app:

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
