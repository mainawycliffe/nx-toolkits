export interface SetupGeneratorSchema {
  project: string;
}

export interface NormalizedSchema extends SetupGeneratorSchema {
  projectRoot: string;
}
