// Core types for docs playground system

export type VirtualFile = {
  path: string;
  contents: string;
  hidden?: boolean;
};

export type VirtualProject = {
  files: VirtualFile[];
  entry?: string; // default '/index.tsx'
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  env?: Record<string, string>;
};

export type SectionSpec = {
  id: string;
  title?: string;
  code?: { file: string; lines: [number, number]; focus?: boolean };
};

export type Decoration = {
  file: string;
  line: number;
  className?: string;
  message?: string;
  range?: [number, number];
};

export type ControlKind =
  | 'boolean'
  | 'select'
  | 'number'
  | 'text'
  | 'color'
  | 'radio'
  | 'json';

export type ControlDef<T = unknown> = {
  id: string;
  label: string;
  kind: ControlKind;
  defaultValue: T;
  options?: { label: string; value: any }[];
  min?: number;
  max?: number;
  step?: number;
  a11yImpactNote?: string;
};

export type VariantAxis = {
  id: string;
  label: string;
  values: string[];
  defaultValue?: string;
};

export type VariantGrid = {
  rows: VariantAxis;
  cols?: VariantAxis;
  fixedProps?: Record<string, any>;
};
