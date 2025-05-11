export type FirebaseNodeRuntimeVersion = '14' | '16' | '18' | '20';

export interface FirebaseGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  codebase?: string;
  nodeVersion: FirebaseNodeRuntimeVersion;
}
