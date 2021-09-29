import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { ActionComponent } from '../actions/interfaces/action-component.interface';
import { ComponentAnchorDirective } from '../directives/component-anchor/component-anchor.directive';
import { IFrameComponent } from './iframe.component';
import { PluginActionViewComponent } from './plugin-action-view.component';
import { PluginConfig } from './plugins.interface';
import { PluginsService } from './plugins.service';

@Component({
  selector: 'yuv-plugin',
  template: `
    <ng-template yuvComponentAnchor></ng-template>
    <link *ngFor="let url of config?.plugin?.styleUrls" rel="stylesheet" [href]="url | safeUrl" />
    <section *ngIf="htmlStyles" [innerHTML]="htmlStyles | safeHtml"></section>
    <iframe *ngIf="src" [src]="src | safeUrl" width="100%" height="100%" frameborder="0"></iframe>
  `,
  styleUrls: [],
  providers: []
})
export class PluginComponent extends IFrameComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(ComponentAnchorDirective) componentAnchor: ComponentAnchorDirective;

  @Input() parent: PluginActionViewComponent | any;

  @Input() config: PluginConfig;

  get id(): string {
    return this.config?.id;
  }

  get src() {
    return typeof this.config?.plugin === 'string' ? this.config?.plugin : this.config?.plugin?.src;
  }

  get htmlStyles() {
    return (
      (this.config?.plugin?.styles?.map((s) => `<style> yuv-plugin[${this.elRef.nativeElement.attributes[0].name}] ${s} </style>`).join('') || '') +
      (this.pluginsService.applyFunction(this.config?.plugin?.html || '', 'component, parent', [this, this.parent]) || '')
    );
  }

  get cmp() {
    return this.componentRef.instance;
  }

  private componentRef: ComponentRef<any>;
  private _afterViewInit = false;

  constructor(elRef: ElementRef, pluginsService: PluginsService, private componentFactoryResolver: ComponentFactoryResolver, private cdRef: ChangeDetectorRef) {
    super(elRef, pluginsService);
  }

  init() {
    this.pluginsService.register(this);
    if (this.config?.plugin?.component) {
      const comp = [...this.componentFactoryResolver['_factories']].find(([key, value]) => this.config.plugin.component === value.selector);
      if (comp) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(comp[0]);
        this.componentRef = this.componentAnchor.viewContainerRef.createComponent(componentFactory) as any;

        if (this.parent instanceof PluginActionViewComponent) {
          (<ActionComponent>this.cmp).selection = this.parent.selection;
          (<ActionComponent>this.cmp).canceled?.pipe(takeUntilDestroy(this)).subscribe(() => this.parent.onCancel());
          (<ActionComponent>this.cmp).finished?.pipe(takeUntilDestroy(this)).subscribe(() => this.parent.onFinish());
        }

        // map all input | output values to the instance
        Object.keys(this.config?.plugin?.inputs || {}).forEach(
          (opt) =>
            (this.cmp[opt] =
              typeof this.config.plugin.inputs[opt] === 'string'
                ? this.pluginsService.applyFunction(this.config.plugin.inputs[opt], 'component, parent', [this, this.parent])
                : this.config.plugin.inputs[opt])
        );
        Object.keys(this.config?.plugin?.outputs || {}).forEach((opt) =>
          this.cmp[opt]
            .pipe(takeUntilDestroy(this))
            .subscribe((event: any) =>
              typeof this.config.plugin.outputs[opt] === 'string'
                ? this.pluginsService.applyFunction(this.config.plugin.outputs[opt], 'event, component, parent', [event, this, this.parent])
                : this.config.plugin.outputs[opt]
            )
        );
        this.cdRef.detectChanges();
      } else {
        console.error('PLUGIN SERVICE: Invalid component name or missing component factory!');
      }
    }
    if (this.src) {
      const onload = () => this.pluginsService.applyFunction(this.config.plugin.outputs.load, 'iframe, component, parent', [this.iframe, this, this.parent]);
      this.iframeInit(this.iframe, '', this.config.plugin?.outputs?.load && onload);
    }
  }

  ngOnInit() {
    if (!this.config) {
      // match custom state by url
      this.pluginsService.getCustomPlugins('states', '', this.pluginsService.currentUrl.replace('/', '')).subscribe(([config]) => {
        this.config = config;
        this._afterViewInit && this.init();
      });
    }
  }

  ngAfterViewInit() {
    this.init();
    this._afterViewInit = true;
  }

  ngOnDestroy() {
    this.componentRef?.destroy();
  }
}
