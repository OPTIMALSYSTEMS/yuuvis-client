import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeResourceUrl } from '@angular/platform-browser';

/**
 * This pipe bypass security and trust the given value to be safe HTML.
 * Only use this when the bound HTML is unsafe (e.g. contains script tags and the code should be executed.).
 * @example
 * <div [innerHtml]="value | safeHtml"></div>
 */
@Pipe({ name: 'safeHtml' })
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(style): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(style);
  }
}
/**
 * This pipe bypass security and trust the given value to be a safe style URL, i.e. a value that can be used in hyperlinks or img src.
 * @example
 * <iframe [src]="previewSrc | safeUrl"></iframe>
 */
@Pipe({ name: 'safeUrl' })
export class SafeUrlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  public transform(url): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
