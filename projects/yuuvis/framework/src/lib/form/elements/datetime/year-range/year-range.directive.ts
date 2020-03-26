import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[yuvYearRange]'
})
export class YearRangeDirective {
  private _selectedYear: string;
  @Input() rangeMin = 0;
  @Input() rangeMax = 9999;

  @HostListener('input', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const year = +input.value;

    if (year && (year < this.rangeMin || year > this.rangeMax)) {
      this.selectedYear = `${new Date().getFullYear()}`;
      input.value = this.selectedYear;
    } else {
      this.selectedYear = `${year}`;
      input.value = this.selectedYear;
    }
  }

  set selectedYear(year: string) {
    this._selectedYear = year;
  }

  get selectedYear() {
    return this._selectedYear;
  }

  constructor() {}
}
