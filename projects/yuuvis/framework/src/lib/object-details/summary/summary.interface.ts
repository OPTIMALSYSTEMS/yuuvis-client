export interface Summary {
  core: SummaryEntry[];
  base: SummaryEntry[];
  extras: SummaryEntry[];
  parent: SummaryEntry[];
}
export interface SummaryEntry {
  label: string;
  value: any;
}
