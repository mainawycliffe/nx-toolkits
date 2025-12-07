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

## Firebase Hosting (⚠️ Experimental)

> **Warning:** This feature is experimental and subject to change. Please report any issues you encounter.

Configure Firebase Hosting for any existing Nx application that produces static build output (React, Vue, Angular, Svelte, etc.).

### Generate Firebase Hosting Configuration

Add Firebase Hosting to an existing Nx app:

```bash
nx g @nx-toolkits/firebase:hosting my-app
```

This will:

- Update `firebase.json` with hosting configuration
- Add a `deploy` target to your project
- Configure the build output directory
- Set up SPA rewrites and security headers (optional)

#### Hosting Generator Options

| Option          | Description                                           | Default       |
| --------------- | ----------------------------------------------------- | ------------- |
| `--project`     | The Nx project to configure for Firebase Hosting      | (required)    |
| `--site`        | Firebase Hosting site ID (defaults to project name)   | project name  |
| `--buildTarget` | The build target to use (e.g., 'build:production')    | 'build'       |
| `--rewrites`    | Add SPA rewrites (redirects all routes to index.html) | true          |
| `--headers`     | Add security headers                                  | true          |
| `--ssr`         | Enable Server-Side Rendering with Cloud Functions     | false         |
| `--ssrFunction` | Name of the Cloud Function for SSR (required if ssr=true) | -        |
| `--region`      | Firebase region for SSR function                      | us-central1   |

### Deploy to Firebase Hosting

After configuring hosting, deploy your app:

```bash
# Build and deploy in one command
nx deploy my-app

# Or use Firebase CLI directly
firebase deploy --only hosting:my-app
```

### Multiple Sites

You can configure multiple apps for Firebase Hosting, each with its own site:

```bash
nx g @nx-toolkits/firebase:hosting app1 --site=app1-prod
nx g @nx-toolkits/firebase:hosting app2 --site=app2-prod
```

### Server-Side Rendering (SSR) with Cloud Functions (EXPERIMENTAL)

You can enable SSR by connecting Firebase Hosting to a Cloud Function:

```bash
# First, create a Firebase Functions app for SSR
nx g @nx-toolkits/firebase:functions my-ssr-function

# Then configure hosting with SSR
nx g @nx-toolkits/firebase:hosting my-app --ssr --ssrFunction=my-ssr-function --region=us-central1
```

This will configure Firebase Hosting to route all requests to your Cloud Function, enabling server-side rendering.

**Important SSR Notes:**

- You must implement the SSR logic in your Cloud Function
- The function should handle rendering your app server-side
- Deploy the function before deploying hosting: `nx deploy my-ssr-function`
- Supported for Angular Universal, Next.js, Nuxt, SvelteKit, etc.

**Example deployment order:**

```bash
# 1. Build your app
nx build my-app

# 2. Deploy SSR function
nx deploy my-ssr-function

# 3. Deploy hosting
nx deploy my-app
```

### Limitations (Experimental)

- SSR support is experimental and requires manual function implementation
- Firebase App Hosting (managed SSR) is not yet supported
- Preview channels must be configured manually
- Custom domain configuration requires manual `firebase.json` edits

Please provide feedback on this experimental feature!
