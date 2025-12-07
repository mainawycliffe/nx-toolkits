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
  projectConfig: any;
  outputPath: string;
  siteName: string;
}
