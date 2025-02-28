export type ClassDefinition = {
  namespace: string;
  className: string;
  fileName: string;
  isInternal: boolean;
  imports: string[];
  domain?: string;
};
