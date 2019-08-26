import { Component, ComponentFactoryResolver, EventEmitter, Input, OnDestroy, Output, Type, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, take, takeUntil } from 'rxjs/operators';
import { ComponentAction, ExternalComponentAction, ListAction, SimpleAction } from '../';
import { SVGIcons } from '../../svg.generated';
import { ActionService, ActionShowCommand } from '../action-service/action.service';
import { ActionComponent } from '../interfaces/action-component.interface';
import { ActionListEntry } from '../interfaces/action-list-entry';
import { ActionComponentAnchorDirective } from './action-component-anchor/action-component-anchor.directive';

export abstract class UnsubscribeOnDestroy implements OnDestroy {

  protected componentDestroyed$: Subject<void>;

  constructor() {
    this.componentDestroyed$ = new Subject<void>();

    let f = this.ngOnDestroy;
    this.ngOnDestroy = () => {
      f.bind(this)();
      this.componentDestroyed$.next();
      this.componentDestroyed$.complete();
    };
  }

  ngOnDestroy() {
    // no-op
  }
}


@Component({
  selector: 'yuv-action-menu',
  templateUrl: './action-menu.component.html',
  styleUrls: ['./action-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ActionMenuComponent extends UnsubscribeOnDestroy {

  @ViewChild(ActionComponentAnchorDirective, { static: false }) eoActionComponentAnchor: ActionComponentAnchorDirective;
  @ViewChild(ActionComponentAnchorDirective, { static: false }) externalDialog: ActionComponentAnchorDirective;

  @Output() finished = new EventEmitter();

  actionLists: {
    common: ActionListEntry[],
    further: ActionListEntry[]
  } = {
      common: [], further: []
    };
  subActionsListHeader = '';
  subActionsList: ActionListEntry[];
  selection: any[];
  target: string;
  showComponent = false;
  actionDescription: string;
  showMenu = false;
  loading = false;
  icons = SVGIcons;

  private _actionCMD: ActionShowCommand;

  set cmd(cmd: ActionShowCommand) {
    this._actionCMD = cmd;
    this.cmdChange.emit(this._actionCMD);
    if (!this.showMenu && cmd.show) {
      this.selection = cmd.selection;
      this.target = cmd.target;
      this.showActionMenu();
    } else if (this.showMenu && !cmd.show) {
      this.hideActionMenu();
    }
  }

  @Input() get cmd() {
    return this._actionCMD;
  }

  @Output()
  cmdChange = new EventEmitter<ActionShowCommand>();

  constructor(private actionService: ActionService,
    private router: Router,
    public viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver) {
    super();

    // subscribe for visibility observable indicating whether to show or hide the actions
    // this.actionService
    //   .actionsShowing$.pipe(
    //     takeUntil(this.componentDestroyed$))
    //   .subscribe((cmd: ActionShowCommand) => {
    //     if (!this.showMenu && cmd.show) {
    //       this.selection = cmd.selection;
    //       this.target = cmd.target;
    //       this.showActionMenu();
    //     } else if (this.showMenu && !cmd.show) {
    //       this.hideActionMenu();
    //     }
    //   });

    this.router.events
      .pipe(
        takeUntil(this.componentDestroyed$),
        filter(evt => evt instanceof NavigationStart),
      )
      .subscribe(() => this.hide());

  }

  private getActions() {
    this.actionService
      .getActionsList(this.selection, this.viewContainerRef)
      .subscribe(actionsList => {
        this.actionLists.common = actionsList;
      });

  }

  hide() {
    // this.actionService.hideActions();
    this.cmd = { show: false, selection: [] };
  }

  showActionDescription(i, event) {
    event.stopPropagation();
    event.preventDefault();
    this.actionDescription = i === this.actionDescription ? null : i;
  }

  private showActionMenu() {
    this.getActions();
    this.showMenu = true;
  }

  private hideActionMenu() {
    this.clear();
    this.showMenu = false;
    this.actionLists = { common: [], further: [] };
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
      simpleAction.run(actionListEntry.availableSelection).pipe(take(1)).subscribe(() => {

        // hide action menu if nothing else is to be shown/done
        if (isSimpleActionOnly) {
          this.onFinish();
        }
      });
    }

    if (isListAction) {
      const listAction = actionListEntry.action as ListAction;
      this.subActionsListHeader = listAction.header;
      this.actionService
        .getExecutableActionsListFromGivenActions(listAction.subActionComponents, this.selection, this.viewContainerRef)
        .subscribe((actionsList: ActionListEntry[]) => this.subActionsList = actionsList);
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
    (<ActionComponent>componentRef.instance).canceled.pipe(take(1)).subscribe(() => this.onCancel());
    (<ActionComponent>componentRef.instance).finished.pipe(take(1)).subscribe(() => this.onFinish());
    if (inputs) {
      Object.keys(inputs).forEach(function (key) {
        componentRef.instance[key] = inputs[key];
      });
    }
  }

  isLinkAction(action) {
    // used from within template
    return !!(action && action.getLink && action.getParams);
  }

  private clear() {
    this.showComponent = false;
    this.subActionsList = null;
    this.actionDescription = null;
    this.viewContainerRef.clear();
    if (this.eoActionComponentAnchor) {
      this.eoActionComponentAnchor.viewContainerRef.clear();
    }
  }

  onCancel() {
    this.clear();
  }

  onFinish() {
    this.finished.emit();
    this.hideActionMenu();
  }
}
