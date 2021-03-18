export interface Catalog {
  name: string;
  namespace: string;
  entries: { name: string; disabled?: boolean }[];
}
