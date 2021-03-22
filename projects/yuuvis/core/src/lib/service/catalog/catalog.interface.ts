export interface Catalog {
  name: string;
  namespace: string;
  entries: CatalogEntry[];
}

export interface CatalogEntry {
  name: string;
  disabled?: boolean;
}
