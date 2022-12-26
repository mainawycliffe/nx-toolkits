export type FirebaseNodeRuntimeVersion = '14' | '16' | '18';

export interface FirebaseGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  codebase?: string;
  firebaseProject?: string;
  nodeVersion: FirebaseNodeRuntimeVersion;
}
