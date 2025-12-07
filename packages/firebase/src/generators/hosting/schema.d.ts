import { ProjectConfiguration } from '@nx/devkit';

export interface FirebaseHostingGeneratorSchema {
  project: string;
  site?: string;
  buildTarget?: string;
  rewrites?: boolean;
  headers?: boolean;
  ssr?: boolean;
  ssrFunction?: string;
  region?: string;
}

export interface NormalizedSchema extends FirebaseHostingGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectConfig: ProjectConfiguration;
  outputPath: string;
  siteName: string;
}
