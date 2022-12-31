export type Framework =
  | 'static'
  | 'spa'
  | 'ssr'
  | 'next.js'
  | 'astro'
  | 'gatsby'
  | 'remix';

export interface HostingGeneratorSchema {
  name: string;
  tags?: string;
  directory?: string;
  project?: string;
  framework: Framework;
}
