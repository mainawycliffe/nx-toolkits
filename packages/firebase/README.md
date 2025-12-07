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
using firebase cli, but with the added benefits of Nx.

### Generate a Firebase Functions app

Use the generator to generate a Firebase Functions app:

```bash
nx g @nx-toolkits/firebase:functions
```

This will generate a Firebase Functions app in the `apps` folder.

#### Generator Options

| Option              | alias       | Description                                                                                                                                                                                   |
| ------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--name`            |             | The name of the nx app to create.                                                                                                                                                             |
| `--firebaseProject` | `--project` | The Firebase project to connect to.                                                                                                                                                           |
| `--codebase`        |             | The codebase to use, allowing you to organize firebase functions according to your needs. Learn more about [Firebase Codebase](https://firebase.googlecom/docs/functions/organize-functions). |
| `--nodeVersion`     |             | The runtime node version to use on firebase functions (14, 16, 18, 20, or 22).                                                                                                                |
| `--genkit`          |             | Add Firebase Genkit support with developer UI and required dependencies.                                                                                                                      |
| `--directory`       |             | The directory to create the app in.                                                                                                                                                           |
| `--tags`            |             | Tags to add to the app.                                                                                                                                                                       |
| `--dry-run`         |             | Run through without making changes.                                                                                                                                                           |

### Deploy a Firebase Functions app

You can deploy a Firebase Functions app using the `nx run deploy` command:

```bash
nx run my-functions-app:deploy
```

The above command with run linting, building, and then deploy the app to Firebase.

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

## Firebase Genkit Support

[Firebase Genkit](https://firebase.google.com/docs/genkit) is a framework for building AI-powered applications. This toolkit provides first-class support for Genkit integration.

### Generate a Firebase Functions app with Genkit

When generating a new Firebase Functions app, you can enable Genkit support by using the `--genkit` flag:

```bash
nx g @nx-toolkits/firebase:functions --genkit
```

This will:

- Install the latest Genkit dependencies:
  - `genkit` - Core Genkit framework
  - `@genkit-ai/google-genai` - Google AI integration
  - `@genkit-ai/firebase` - Firebase integration for Genkit
  - `zod` - Schema validation library
- Install `tsx` for TypeScript execution during development
- Set up your project for Genkit development

### Launch the Genkit Developer UI

Once you have a Firebase Functions app with Genkit support, you can launch the Genkit Developer UI using:

```bash
nx run my-functions-app:genkit-ui
```

This will start the Genkit Developer UI at `http://localhost:4000` by default and automatically open it in your browser.

#### Genkit UI Executor Options

| Option   | Description                             | Default   |
| -------- | --------------------------------------- | --------- |
| `--port` | Port to run the Genkit Developer UI on  | 4000      |
| `--host` | Host to bind the Genkit Developer UI to | localhost |
| `--open` | Automatically open the browser          | true      |

**Example:**

```bash
# Run on a different port without auto-opening the browser
nx run my-functions-app:genkit-ui --port=3000 --open=false
```
