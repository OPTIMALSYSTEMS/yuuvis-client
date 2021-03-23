export interface Catalog {
  name: string;
  namespace: string;
  entries: CatalogEntry[];
  readonly?: boolean;
}

export interface CatalogEntry {
  name: string;
  disabled?: boolean;
}
