import { Directive, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Directive({
  selector: '[yuvTitle]'
})
export class TitleDirective {
  @Input('yuvTitle')
  set title(title: string) {
    title?.trim() && this.titleService.setTitle(title.trim());
  }

  constructor(private titleService: Title) {}
}
