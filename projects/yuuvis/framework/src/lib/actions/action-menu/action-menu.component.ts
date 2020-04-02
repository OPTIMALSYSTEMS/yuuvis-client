import { Component, ComponentFactoryResolver, EventEmitter, Input, OnDestroy, Output, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { IconRegistryService } from '@yuuvis/common-ui';
import { DmsObject } from '@yuuvis/core';
import { filter, take } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { clear } from '../../svg.generated';
import { ActionService } from '../action-service/action.service';
import { ActionComponent } from '../interfaces/action-component.interface';
import { ActionListEntry } from '../interfaces/action-list-entry';
import { ComponentAction, ExternalComponentAction, ListAction, SimpleAction } from '../interfaces/action.interface';
import { ActionComponentAnchorDirective } from './action-component-anchor/action-component-anchor.directive';

/**
 * # yuv-action-menu
 *
 * Creates a menu of available actions for a selection of items.
 * The component will be positioned absolutely, so a parent has to be positioned relatively.
 *
 * ```html
<yuv-action-menu [(visible)]="showActionMenu" [selection]="selection"></yuv-action-menu>
```
 *
 */
@Component({
  selector: 'yuv-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.scss'],
  host: { class: 'yuv-action-menu' }
})
export class ActionMenuComponent implements OnDestroy {
  @ViewChild(ActionComponentAnchorDirective) eoActionComponentAnchor: ActionComponentAnchorDirective;
  @ViewChild(ActionComponentAnchorDirective) externalDialog: ActionComponentAnchorDirective;

  /**
   * Specifies the items for which the actions should be provided.
   */
  @Input() selection: DmsObject[] = [];

  /**
   * Specifies the visibility of the menu.
   */
  @Input() set visible(visible: boolean) {
    if (!this.showMenu && visible) {
      this.showActionMenu();
    } else if (this.showMenu && !visible) {
      this.hideActionMenu();
    }
  }
  /**
   * @ignore
   * Part of two-way-databinding
   */
  @Output() visibleChange = new EventEmitter();

  /**
   * Callback to invoke when the action is finished.
   */
  @Output() onFinish = new EventEmitter();

  actionLists: {
    common: ActionListEntry[];
    further: ActionListEntry[];
  } = {
    common: [],
    further: []
  };
  subActionsListHeader = '';
  subActionsList: ActionListEntry[];
  showComponent = false;
  // actionDescription: string;
  showDescriptions: boolean;
  showMenu = false;
  loading = false;

  constructor(
    private actionService: ActionService,
    private router: Router,
    public viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([clear]);
    this.router.events
      .pipe(
        takeUntilDestroy(this),
        filter(evt => evt instanceof NavigationStart)
      )
      .subscribe(() => this.hide());
  }

  private getActions() {
    this.loading = true;
    this.actionService.getActionsList(this.selection, this.viewContainerRef).subscribe(
      actionsList => {
        this.actionLists.common = actionsList;
        this.loading = false;
      },
      err => {
        this.loading = false;
      }
    );
  }

  hide() {
    this.visible = false;
  }

  // showActionDescription(i, event) {
  //   event.stopPropagation();
  //   event.preventDefault();
  //   this.actionDescription = i === this.actionDescription ? null : i;
  // }

  private showActionMenu() {
    this.showMenu = true;
    this.getActions();
  }

  private hideActionMenu() {
    this.clear();
    this.showMenu = false;
    this.actionLists = { common: [], further: [] };
    this.visibleChange.emit(false);
  }

  onClick(actionListEntry: ActionListEntry) {
    // It is possible that actions implement more than one action interface
    // so we should be aware of running an action and then open its sub actions

    const isSimpleAction = !!actionListEntry.action['run'];
    const isListAction = actionListEntry.action.hasOwnProperty('subActionComponents');
    const isComponentAction = actionListEntry.action.hasOwnProperty('component');
    const isExternalComponentAction = actionListEntry.action.hasOwnProperty('extComponents');
    const isSimpleActionOnly = isSimpleAction && !isListAction && !isComponentAction && !isExternalComponentAction;

    if (isSimpleAction) {
      const simpleAction = actionListEntry.action as SimpleAction;
      simpleAction
        .run(actionListEntry.availableSelection)
        .pipe(take(1))
        .subscribe(() => {
          // hide action menu if nothing else is to be shown/done
          if (isSimpleActionOnly) {
            this.finish();
          }
        });
    }

    if (isListAction) {
      const listAction = actionListEntry.action as ListAction;
      this.subActionsListHeader = listAction.header;
      this.actionService
        .getExecutableActionsListFromGivenActions(listAction.subActionComponents, this.selection, this.viewContainerRef)
        .subscribe((actionsList: ActionListEntry[]) => (this.subActionsList = actionsList));
    } else if (isComponentAction) {
      const componentAction = actionListEntry.action as ComponentAction;
      this.showActionComponent(componentAction.component, this.eoActionComponentAnchor, this.componentFactoryResolver, true);
    } else if (isExternalComponentAction) {
      const extComponentAction = actionListEntry.action as ExternalComponentAction;
      this.showActionComponent(extComponentAction.extComponents, this.externalDialog, this.componentFactoryResolver, false);
    }
  }

  private showActionComponent(component: Type<any>, viewContRef, factoryResolver, showComponent, inputs?: any) {
    this.showComponent = showComponent;
    let componentFactory = factoryResolver.resolveComponentFactory(component);
    let anchorViewContainerRef = viewContRef.viewContainerRef;
    anchorViewContainerRef.clear();
    let componentRef = anchorViewContainerRef.createComponent(componentFactory);
    (<ActionComponent>componentRef.instance).selection = this.selection;
    (<ActionComponent>componentRef.instance).canceled.pipe(take(1)).subscribe(() => this.cancel());
    (<ActionComponent>componentRef.instance).finished.pipe(take(1)).subscribe(() => this.finish());
    if (inputs) {
      Object.keys(inputs).forEach(function(key) {
        componentRef.instance[key] = inputs[key];
      });
    }
  }

  isLinkAction(action) {
    // used from within template
    return !!(action && action.getLink);
  }

  private clear() {
    this.showComponent = false;
    this.subActionsList = null;
    // this.actionDescription = null;
    this.viewContainerRef.clear();
    if (this.eoActionComponentAnchor) {
      this.eoActionComponentAnchor.viewContainerRef.clear();
    }
  }

  cancel() {
    this.clear();
  }

  finish() {
    this.onFinish.emit();
    this.hideActionMenu();
  }

  ngOnDestroy() {}
}
