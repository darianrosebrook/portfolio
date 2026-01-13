// Shared types for FontInspector module
// Separated to avoid circular dependencies

export interface AnatomyFeature {
  feature: string;
  label: string;
  labelPosition: string;
  disabled: boolean;
  selected: boolean;
  readonly: boolean;
}
