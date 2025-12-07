---
applyTo: 'packages/firebase/**'
---

# Firebase Nx Toolkit Instructions

You are working on the Firebase Nx Toolkit package (`@nx-toolkits/firebase`) which provides generators and executors for Firebase projects within an Nx workspace.

## Package Overview

This package generates Firebase Functions apps with optional Firebase Genkit support, providing seamless integration with Nx build system and Firebase CLI.

## Code Style and Conventions

### TypeScript Conventions

1. **Default Exports for Main Functions**: Use default exports for generator and executor main functions

   ```typescript
   export default async function (tree: Tree, options: Schema) {
     // implementation
   }
   ```

2. **Named Exports for Types and Interfaces**: Always use named exports for TypeScript types and interfaces

   ```typescript
   export interface SchemaName {
     // properties
   }

   export type TypeName = 'value1' | 'value2';
   ```

3. **Schema Files**: Every generator and executor must have:
   - `schema.json` - JSON schema definition with descriptions and prompts
   - `schema.d.ts` - TypeScript type definitions
   - Implementation file (e.g., `generator.ts` or `executor.ts`)

### File Organization

```
src/
├── generators/
│   └── [generator-name]/
│       ├── generator.ts          # Main generator logic (default export)
│       ├── generator.spec.ts     # Unit tests
│       ├── schema.json           # JSON schema with x-prompt for interactivity
│       ├── schema.d.ts           # TypeScript types
│       ├── files/                # Template files
│       │   └── **/*__template__  # Files to be generated
│       └── utilities/            # Helper functions
│           └── *.ts              # Utility functions (default exports)
├── executors/
│   └── [executor-name]/
│       ├── executor.ts           # Main executor logic (default export)
│       ├── executor.spec.ts      # Unit tests (recommended)
│       ├── schema.json           # JSON schema
│       └── schema.d.ts           # TypeScript types
└── index.ts                      # Package exports
```

**Note**: This structure follows Nx plugin conventions as documented in the official Nx guides.

### Generator Patterns

1. **Normalize Options**: Always create a `NormalizedSchema` interface that extends the base schema:

   ```typescript
   export interface NormalizedSchema extends GeneratorSchema {
     projectName: string;
     projectRoot: string;
     projectDirectory: string;
     parsedTags: string[];
   }
   ```

2. **Utility Functions**: Break down generator logic into focused utility functions:

   - `addDependencies.ts` - Handle package.json dependencies
   - `addFiles.ts` - Copy and process template files
   - `addProjectorConfigs.ts` - Add Nx project configuration
   - `addFirebaseJSON.ts` - Update firebase.json configuration

3. **Async/Await Pattern**: Use async/await for generator functions:
   ```typescript
   export default async function (tree: Tree, options: Schema) {
     const normalizedOptions = normalizeOptions(tree, options);

     addProjectConfigs(tree, normalizedOptions);
     addFiles(tree, normalizedOptions);

     await formatFiles(tree);

     return addDependencies(tree, normalizedOptions);
   }
   ```

### Executor Patterns

1. **Return Success Object**: Executors must return `{ success: boolean }`:

   ```typescript
   export default async function runExecutor(options: ExecutorSchema, context: ExecutorContext) {
     try {
       // executor logic
       return { success: true };
     } catch (error) {
       console.error('Error message:', error);
       return { success: false };
     }
   }
   ```

2. **Process Management**: For long-running processes:
   - Use `child_process.exec` for spawning processes
   - Handle SIGTERM and SIGINT for graceful shutdown
   - Stream stdout and stderr for real-time output
   - Set appropriate environment variables (e.g., `GENKIT_ENV: 'dev'`)

### Project Configuration

1. **Nx Targets**: Standard targets for Firebase functions projects:

   - `lint` - ESLint with `@nx/eslint:lint`
   - `test` - Jest with `@nx/jest:jest`
   - `build` - esbuild with `@nx/esbuild:esbuild` (generates package.json)
   - `serve` - Firebase emulator using command executor
   - `deploy` - Firebase deploy using command executor

2. **Codebase Support**: Always support Firebase codebase organization:

   ```typescript
   const appendCodebase = codebase && codebase !== 'default' ? `:${codebase}` : '';
   ```

   **Important**: The `codebase` property in `firebase.json` helps manage multiple repositories or monorepos. Per Firebase documentation:

   - Codebase names must be less than 63 characters
   - Can contain only lowercase letters, numeric characters, underscores, and dashes
   - Helps prevent accidental deletion of functions from other codebases during deployment
   - Deploy specific codebases using: `firebase deploy --only functions:codebase-name`

### Schema Definitions

1. **Interactive Prompts**: Use `x-prompt` for user-friendly CLI experience:

   ```json
   {
     "genkit": {
       "type": "boolean",
       "description": "Add Firebase Genkit support with developer UI",
       "default": false,
       "x-prompt": "Would you like to add Firebase Genkit support?"
     }
   }
   ```

2. **List Prompts**: Use for predefined options:
   ```json
   {
     "x-prompt": {
       "message": "What node runtime version would you like to use?",
       "type": "list",
       "items": [
         { "value": "20", "label": "Node 20" },
         { "value": "22", "label": "Node 22 (preview)" }
       ]
     }
   }
   ```

## Dependency Management

1. **Version Pinning**: Use `^` for minor version updates:

   - Firebase packages: `'^13.0.0'` (firebase-admin), `'^6.0.0'` (firebase-functions)
   - Match Nx workspace version for Nx packages
   - Note: Firebase Functions supports Node.js 14, 16, 18, 20, and 22 (preview) runtimes

2. **Conditional Dependencies**: Add optional dependencies based on flags:

   ```typescript
   if (options?.genkit) {
     dependencies['genkit'] = 'latest';
     dependencies['@genkit-ai/google-genai'] = 'latest';
     // ...
   }
   ```

3. **Dev vs Production**: Separate dependencies appropriately:
   - Runtime (dependencies): `firebase-admin`, `firebase-functions`, `genkit`, AI provider packages
   - Development (devDependencies): `tsx`, `esbuild`, `firebase-functions-test`, `@nx/*` packages

## Firebase Genkit Integration

1. **Required Dependencies** (when genkit flag is enabled):

   - `genkit` - Core framework
   - `@genkit-ai/google-genai` - Google AI integration
   - `@genkit-ai/firebase` - Firebase integration for Cloud Functions
   - `zod` - Schema validation (required for flow input/output schemas)
   - `tsx` - TypeScript execution (dev dependency)

2. **Genkit UI Executor**:

   - Default port: 4000
   - Default host: localhost
   - Command pattern: `npx genkit start -- npx tsx --watch src/index.ts`
   - Environment: `GENKIT_ENV=dev`
   - Per Genkit docs: The UI provides reflection API access for testing flows locally
   - Flows must be wrapped in `onCallGenkit` for deployment to Firebase

3. **Genkit Best Practices**:
   - All deployed flows should have an authorization policy
   - Use Firebase Secret Manager for API keys (e.g., `GEMINI_API_KEY`)
   - Consider App Check enforcement for production deployments
   - Flows are deployed as callable Cloud Functions

## Testing

1. **Unit Tests**: Use Jest with `@nx/devkit/testing`:

   ```typescript
   import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';

   describe('generator', () => {
     let appTree: Tree;

     beforeEach(() => {
       appTree = createTreeWithEmptyWorkspace();
     });

     it('should run successfully', async () => {
       await generator(appTree, options);
       const config = readProjectConfiguration(appTree, 'test');
       expect(config).toBeDefined();
     });
   });
   ```

2. **Snapshot Testing**: Use inline snapshots for project configurations:
   ```typescript
   expect(config).toMatchInlineSnapshot(`...`);
   ```

## Documentation

1. **README Updates**: Always update README.md when adding features:

   - Add new options to Generator Options table
   - Document new executors with examples
   - Include default values and descriptions

2. **Commit Messages**: Follow conventional commits with scope:
   ```
   feat(firebase): add new feature
   fix(firebase): fix bug description
   docs(firebase): update documentation
   test(firebase): add tests
   chore(firebase): maintenance task
   ```

## Common Patterns

1. **Firebase JSON Updates**: Merge existing configuration, don't overwrite:

   ```typescript
   const firebaseJson = tree.exists('firebase.json') ? JSON.parse(tree.read('firebase.json', 'utf-8')) : { functions: [] };
   ```

2. **Template Processing**: Use `__template__` suffix for files requiring processing:

   ```
   files/
     package.json__template__
     tsconfig.json__template__
   ```

3. **Workspace Layout**: Use `workspaceLayout().appsDir` for project root:
   ```typescript
   const projectRoot = `${workspaceLayout().appsDir}/${projectDirectory}`;
   ```

## Error Handling

1. **Validation**: Validate required inputs early:

   ```typescript
   if (!projectName) {
     throw new Error('Project name is required');
   }
   ```

2. **Graceful Degradation**: Provide fallbacks for optional features:
   ```typescript
   const nxWorkspaceVersion = JSON.parse(tree.read('package.json').toString()).devDependencies['@nx/workspace'] || 'latest';
   ```

## Best Practices

1. **Keep Utilities Focused**: Each utility function should have a single responsibility
2. **Use Nx Devkit**: Leverage `@nx/devkit` utilities (formatFiles, addProjectConfiguration, etc.)
3. **Follow Firebase Conventions**: Align with official Firebase documentation and patterns
   - Support Firebase codebase organization for monorepos
   - Use TypeScript for type safety (supported natively by Firebase Functions)
   - Structure functions for modularity (multiple files/groups as needed)
4. **Support Nx Workspace**: Ensure compatibility with Nx caching, affected commands, and task orchestration
5. **Interactive CLI**: Always provide helpful prompts and default values
6. **Documentation First**: Update docs before considering a feature complete
7. **Test Thoroughly**: Include unit tests for all generators and executors
8. **Security by Default**: For Genkit flows, always include guidance on auth policies and App Check

## Firebase Functions Deployment Notes

- Functions are deployed to Google Cloud infrastructure
- Supports JavaScript, TypeScript, and Python (this plugin focuses on TypeScript)
- Requires Firebase Blaze (pay-as-you-go) plan for deployment
- Functions auto-scale based on load
- Build artifacts are stored in Cloud Storage and Artifact Registry
- Use `firebase emulators:start` for local testing before deployment

## References

- Nx Documentation: https://nx.dev
- Firebase Documentation: https://firebase.google.com/docs
- Firebase Genkit: https://genkit.dev/docs/deployment/firebase/
- Conventional Commits: https://www.conventionalcommits.org/
