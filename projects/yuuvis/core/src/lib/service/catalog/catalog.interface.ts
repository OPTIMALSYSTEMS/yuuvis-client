export interface BaseCatalog {
  entries: CatalogEntry[];
  readonly?: boolean;
}
export interface Catalog extends BaseCatalog {
  qname: string;
  // If a tenant is set the catalog is provided from the tenants scope.
  // Could be NULL if no tenant scoped changes have been made. In this case
  // you need to call POST instaed of PATH when making changes to the catalog
  tenant?: string;
}

export interface CatalogEntry {
  name: string;
  disabled?: boolean;
  missing?: boolean;
}
