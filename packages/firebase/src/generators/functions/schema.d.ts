export type FirebaseNodeRuntimeVersion = '14' | '16' | '18' | '20';
export type FirebaseRuntime = 'python' | 'nodejs';

export interface FirebaseGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  codebase?: string;
  firebaseProject?: string;
  nodeVersion: FirebaseNodeRuntimeVersion;
  runtime: FirebaseRuntime;
}
