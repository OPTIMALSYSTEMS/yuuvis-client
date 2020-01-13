import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Inject, Input, Optional } from '@angular/core';
import { IconService } from '../service/icon.service';
import { IconRegistryService } from '../service/iconRegistry.service';

@Component({
  selector: 'yuv-icon',
  template: `
    <ng-content></ng-content>
  `,
  styleUrls: ['./icon.component.scss'],
  host: { class: 'yuv-icon' },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IconComponent {
  private svgIcon: SVGElement;
  private svgWidth = 24;
  private svgHeight = 24;

  @Input()
  set svgDim(val: number[]) {
    this.svgWidth = val[0] || this.svgWidth;
    this.svgHeight = val[0] || this.svgHeight;
  }

  @Input('iconSrc')
  set iconSrc(iconSrc: string) {
    this.removeSVG();
    this.iconService.fetch(iconSrc).subscribe(svg => this.createSvg(svg));
  }

  @Input('svg')
  set icon(icon: SVGElement) {
    this.removeSVG();
    this.createSvg(icon);
  }

  @Input('icon')
  set svg(iconName: string) {
    this.removeSVG();
    try {
      const svgData = this.iconRegService.getIcon(iconName);
      this.createSvg(svgData);
    } catch (error) {
      console.warn(error);
      this.svgIcon = this.document.createElementNS('http://www.w3.org/2000/svg', 'path');
      this.element.nativeElement.appendChild(this.svgIcon);
    }
  }

  get width(): string {
    return `${this.svgWidth}`;
  }

  get height(): string {
    return `${this.svgHeight}`;
  }

  constructor(
    private element: ElementRef,
    private iconService: IconService,
    private iconRegService: IconRegistryService,
    @Optional() @Inject(DOCUMENT) private document: any
  ) {}

  private removeSVG() {
    if (this.svgIcon) {
      this.element.nativeElement.removeChild(this.svgIcon);
    }
  }

  private createSvg(svgData: any) {
    this.svgIcon = this.svgElementFromString(svgData);
    this.element.nativeElement.appendChild(this.svgIcon);
  }

  private svgElementFromString(svgData: string): SVGElement {
    const div = this.document.createElement('DIV');
    div.innerHTML = svgData;
    const svg = div.querySelector('svg');
    this.setAttribute(svg);
    return svg || this.document.createElementNS('http://www.w3.org/2000/svg', 'path');
  }

  private setAttribute(svg: HTMLElement) {
    svg.setAttribute('width', `${this.width}`);
    svg.setAttribute('height', `${this.height}`);
  }
}
