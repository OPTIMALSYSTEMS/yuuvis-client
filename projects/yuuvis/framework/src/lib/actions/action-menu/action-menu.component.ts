import { Component, EventEmitter, Input, OnDestroy, Output, Type, ViewChild, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, Router } from '@angular/router';
import { DmsObject } from '@yuuvis/core';
import { filter, finalize, take, tap } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { ComponentAnchorDirective } from '../../directives/component-anchor/component-anchor.directive';
import { PluginActionViewComponent } from '../../plugins/plugin-action-view.component';
import { clear } from '../../svg.generated';
import { ActionService } from '../action-service/action.service';
import { ActionComponent } from '../interfaces/action-component.interface';
import { ActionListEntry } from '../interfaces/action-list-entry';
import { ComponentAction, ExternalComponentAction, LinkAction, ListAction, SimpleAction } from '../interfaces/action.interface';

/**
 * This component creates a menu of available actions for a selection of items. The action menu includes such actions as `delete`, `download` and `upload`.
 * This component will be positioned absolutely, so a parent has to be positioned relatively.
 *
 * [Screenshot](../assets/images/yuv-action-menu.gif)
 *
 * @example
 * <yuv-action-menu [selection]="actionMenuSelection" [(visible)]="showActionMenu"></yuv-action-menu>
 *
 */
@Component({
  selector: 'yuv-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.scss'],
  host: { class: 'yuv-action-menu' }
})
export class ActionMenuComponent implements OnDestroy {
  @ViewChild(ComponentAnchorDirective) componentAnchor: ComponentAnchorDirective;

  /**
   * Specifies the items for which the actions should be provided.
   */
  @Input() selection: DmsObject[] = [];
  /**
   * Set to true when using dark background color for action menu
   * eventhough you are not on dark mode
   */
  @Input() dark: boolean;
  /**
   * Set ID of Action that should be shown when menu opens.
   */
  @Input() activeAction: string;
  /**
   * List of actions (action IDs = actions selector) that should not be shown.
   * Those actions will then not be shown in the action menue even if their
   * `isExecutable()` function passes.
   */
  @Input() skipActions: string[];

  /**
   * Specifies the visibility of the menu.
   */
  @Input()
  set visible(visible: boolean) {
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
  @Output() finished = new EventEmitter();

  /**
   * Callback to invoke when the action is clicked.
   */
  @Output() actionSelected = new EventEmitter<ActionListEntry>();

  actionLists: {
    common: ActionListEntry[];
    further: ActionListEntry[];
  } = {
      common: [],
      further: []
    };
  subActionsHeader = '';
  subActionsList: ActionListEntry[];
  showComponent = false;
  // actionDescription: string;
  showDescriptions: boolean;
  showMenu = false;
  loading = false;
  fullscreen = '';

  constructor(
    private actionService: ActionService,
    private router: Router,
    public viewContainerRef: ViewContainerRef,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([clear]);
    this.router.events
      .pipe(
        takeUntilDestroyed(),
        filter((evt) => evt instanceof NavigationStart)
      )
      .subscribe(() => this.finish());
  }

  private getActions() {
    this.loading = true;
    this.actionService
      .getActionsList(this.selection, this.viewContainerRef, this.skipActions)
      .pipe(
        finalize(() => (this.loading = false)),
        tap((actionsList) => {
          this.actionLists.common = actionsList.filter((actionListEntry) => actionListEntry.action.group === 'common');
          this.actionLists.further = actionsList.filter((actionListEntry) => actionListEntry.action.group === 'further');
          if (this.activeAction) {
            const action = actionsList.find((a) => a.id === this.activeAction);
            setTimeout(() => (action ? this.onClick(action) : this.finish()));
          }
        })
      )
      .subscribe();
  }

  onOutsideClick() {
    if (!this.showComponent) {
      this.hide();
    }
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

  onClick(actionListEntry: ActionListEntry, evt?: MouseEvent) {
    // It is possible that actions implement more than one action interface
    // so we should be aware of running an action and then open its sub actions

    const isSimpleAction = !!(actionListEntry.action as SimpleAction).run;
    const isLinkAction = !!(actionListEntry.action as LinkAction).getLink;
    const isListAction = actionListEntry.action.hasOwnProperty('subActionComponents');
    const isComponentAction = actionListEntry.action.hasOwnProperty('component');
    const isExternalComponentAction = actionListEntry.action.hasOwnProperty('extComponent');
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
    } else if (isLinkAction) {
      const action = actionListEntry.action as LinkAction;
      if (!evt?.ctrlKey) {
        this.router.navigate([action.getLink(actionListEntry.availableSelection)], {
          queryParams: action.getParams ? action.getParams(actionListEntry.availableSelection) : {},
          fragment: action.getFragment ? action.getFragment(actionListEntry.availableSelection) : null
        });
      }
      this.finish();
    }

    if (isListAction) {
      const listAction = actionListEntry.action as ListAction;
      this.actionService
        .getExecutableActionsListFromGivenActions(listAction.subActionComponents, actionListEntry.availableSelection, this.viewContainerRef)
        .subscribe((actionsList: ActionListEntry[]) => (this.subActionsList = actionsList));
    } else if (isComponentAction) {
      const componentAction = actionListEntry.action as ComponentAction;
      this.showActionComponent(componentAction.component, componentAction, actionListEntry.availableSelection);
    } else if (isExternalComponentAction) {
      const extComponentAction = actionListEntry.action as ExternalComponentAction;
      const fullscreen = (extComponentAction.extComponent as any)?.action?.fullscreen || '';
      this.fullscreen = typeof fullscreen === 'string' ? fullscreen : '100vw';
      this.showActionComponent(extComponentAction.extComponent, extComponentAction, actionListEntry.availableSelection);
    }

    this.subActionsHeader = (actionListEntry.action as any)?.header;
    this.actionSelected.emit(actionListEntry);
  }

  private showActionComponent(component: Type<any> | any, action: ComponentAction | ExternalComponentAction, selection: any[]) {
    this.showComponent = true;
    let anchorViewContainerRef = this.componentAnchor.viewContainerRef;
    anchorViewContainerRef.clear();
    let componentRef = anchorViewContainerRef.createComponent(component._component || component);
    if (componentRef.instance instanceof PluginActionViewComponent) {
      (<PluginActionViewComponent>componentRef.instance).action = component.action;
    }
    (<ActionComponent>componentRef.instance).selection = selection;
    (<ActionComponent>componentRef.instance).canceled.pipe(take(1)).subscribe(() => this.cancel());
    (<ActionComponent>componentRef.instance).finished.pipe(take(1)).subscribe(() => this.finish());

    Object.keys(action.inputs || {}).forEach((key) => (componentRef.instance[key] = action.inputs[key]));
  }

  isLinkAction(action) {
    // used from within template
    return !!(action && action.getLink);
  }

  private clear() {
    this.fullscreen = '';
    this.showComponent = false;
    this.subActionsList = null;
    this.subActionsHeader = '';
    // this.actionDescription = null;
    this.activeAction = null;
    this.viewContainerRef.clear();
    this.componentAnchor?.viewContainerRef.clear();
    this.actionSelected.emit();
  }

  cancel() {
    this.activeAction ? this.finish() : this.clear();
  }

  finish() {
    this.finished.emit();
    this.hideActionMenu();
  }

  ngOnDestroy() { }
}
