export type Framework =
  | 'angular'
  | 'react'
  | 'vue'
  | 'marko'
  | 'dom'
  | 'preact';

export interface SetupGeneratorSchema {
  project: string;
  framework: Framework;
}
