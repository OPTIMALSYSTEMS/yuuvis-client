export interface Summary {
  core: SummaryEntry[];
  base: SummaryEntry[];
  extras: SummaryEntry[];
}
export interface SummaryEntry {
  label: string;
  value: any;
}
