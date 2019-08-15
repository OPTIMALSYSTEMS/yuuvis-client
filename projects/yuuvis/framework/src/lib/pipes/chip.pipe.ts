import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'Chip' })
export class ChipPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value): SafeHtml {
    value = value
      .map(val => `<div class="chip">${val}</div>`)
      .join()
      .replace(/<\/div>,/g, '</div> ');

    return this.sanitizer.bypassSecurityTrustHtml(value);
  }
}
