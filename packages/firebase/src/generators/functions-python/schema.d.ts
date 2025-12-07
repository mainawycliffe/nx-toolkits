export interface FirebaseFunctionsPythonGeneratorSchema {
  name: string;
  firebaseProject: string;
  codebase?: string;
  pythonVersion?: '310' | '311' | '312';
  directory?: string;
  tags?: string;
  linter?: 'ruff' | 'pylint' | 'none';
}
