export interface Summary {
  core: SummaryEntry[];
  base: SummaryEntry[];
  extras: SummaryEntry[];
  parent: SummaryEntry[];
}
export interface SummaryEntry {
  label: string;
  key: string;
  value: any;
  value2?: any;
  order?: number;
}
