import { Component, ElementRef, Input } from '@angular/core';
import { IconService } from './icon.service';

@Component({
  selector: 'yuv-icon',
  template: '',
  styleUrls: ['./icon.component.scss'],
  providers: [IconService],
  host: { class: 'yuv-icon' }
})
export class IconComponent {
  // path to the icon
  @Input('iconSrc')
  set iconSrc(iconSrc: string) {
    this.iconService.fetch(iconSrc).subscribe(svg => this.render(svg));
  }

  // actual svg markup to be rendered
  @Input('svg')
  set svg(svg: string) {
    this.render(svg);
  }

  constructor(private elementRef: ElementRef, private iconService: IconService) {}

  // renders the actual svg string by adding it to the DOM
  private render(svg: string) {
    const svgElement: SVGElement = this.svgElementFromString(svg);
    if (svgElement && svgElement instanceof SVGElement) {
      this.elementRef.nativeElement.innerHTML = '';
      this.elementRef.nativeElement.appendChild(svgElement);
    } else {
      console.error('Icon is not a valid SVGElement: ' + svg);
    }
  }
  /**
   * Transforms a string to an SVGElement.
   * @param str - the string to be converted
   * @return the SVGElement created from the input or NULL if conversion failed
   */
  private svgElementFromString(str: string): SVGElement {
    const div = document.createElement('DIV');
    div.innerHTML = str;
    return div.querySelector('svg') as SVGElement;
  }
}
