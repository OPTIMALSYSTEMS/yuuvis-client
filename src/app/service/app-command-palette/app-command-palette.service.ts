import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CommandPaletteCommand, CommandPaletteService } from '@yuuvis/command-palette';
import {
  BaseObjectTypeField,
  DmsObject,
  DmsService,
  PendingChangesService,
  SearchQuery,
  SearchResult,
  SearchService,
  SystemService,
  TranslateService
} from '@yuuvis/core';
import { ActionService, ComponentStateChangeEvent, ComponentStateParams, ComponentStateService, LayoutService, LayoutSettings } from '@yuuvis/framework';
import { Subscription } from 'rxjs';
import { FrameService } from '../../components/frame/frame.service';

@Injectable({
  providedIn: 'root'
})
export class AppCommandPaletteService {
  private DISABLED_CAUSE_KEY = 'cmp.disabled.cause.pending.';
  private dmsObjectCommandSubscription: Subscription;
  private objectTypeBaseProperties = this.system.getBaseProperties();

  private registeredDmsObjectCommands: string[] = [];
  private layoutSettings: LayoutSettings;
  private createCommandsAdded: boolean;

  constructor(
    private system: SystemService,
    private router: Router,
    private searchService: SearchService,
    private pendingChangesService: PendingChangesService,
    private frameService: FrameService,
    private dmsService: DmsService,
    private cmpService: CommandPaletteService,
    private componentStateService: ComponentStateService,
    private translate: TranslateService,
    private actionService: ActionService,
    private layoutService: LayoutService
  ) {
    this.cmpService.searchModeExplaination = this.translate.instant('yuv.client.cmp.searchmode.explain');
    this.translate.onLangChange.subscribe((_) => {
      this.cmpService.searchModeExplaination = this.translate.instant('yuv.client.cmp.searchmode.explain');

      // we need to defer this a little bit because translations need to be fetched from the backend
      this.cmpService.updateCommands(this.getCommandPaletteCommands());
    });

    this.layoutService.layoutSettings$.subscribe((s: LayoutSettings) => (this.layoutSettings = s));

    this.system.system$.subscribe((_) => {
      const createCommands = this.system.getObjectTypes(true, 'create').map((t) => ({
        id: `create__${t.id}`,
        label: this.translate.instant('yuv.client.cmp.create', { name: t.label })
      }));
      if (this.createCommandsAdded) {
        this.cmpService.updateCommands(createCommands);
      } else {
        this.cmpService.registerCommands(createCommands).subscribe((c: CommandPaletteCommand) => {
          const tokens = c.id.split('__');
          const objectTypeID = tokens[1];
          this.router.navigate(['create'], {
            queryParams: {
              objectType: encodeURIComponent(objectTypeID)
            }
          });
        });
      }
    });

    this.pendingChangesService.tasks$.subscribe((tasks: { id: string; message?: string }[]) => {
      // disable command palette if there are pending changes
      if (tasks?.length) {
        this.cmpService.addDisabledCause({ id: this.DISABLED_CAUSE_KEY, message: this.translate.instant('yuv.client.cmp.disabled.cause.pending-changes') });
      } else {
        this.cmpService.removeDisabledCause(this.DISABLED_CAUSE_KEY);
      }
    });

    this.cmpService.command$.subscribe((c: CommandPaletteCommand) => {
      if (c.id.startsWith('sr__')) {
        const tokens = c.id.split('__');
        this.router.navigate(['object', tokens[1]]);
      }
    });

    this.cmpService.onSearchTerm = (term, cb) => {
      this.searchService
        .search(
          new SearchQuery({
            term: term,
            fields: [BaseObjectTypeField.OBJECT_ID, this.objectTypeBaseProperties.title, this.objectTypeBaseProperties.description]
          })
        )
        .subscribe((res: SearchResult) => {
          cb(
            res.items.map((i) => ({
              id: `sr__${i.fields.get(BaseObjectTypeField.OBJECT_ID)}`,
              label: i.fields.get(this.objectTypeBaseProperties.title),
              description: i.fields.get(this.objectTypeBaseProperties.description)
            }))
          );
        });
    };

    // listen to components state changes to add new commands based on them
    this.componentStateService.componentStateChange$.subscribe((e: ComponentStateChangeEvent) => {
      if (e.action === 'add') {
        this.addComponentCommands(e.state.component, e.state.params);
      } else if (e.action === 'remove') {
        this.removeComponentCommands(e.state.component, e.state.params);
      } else if (e.action === 'update') {
        this.removeComponentCommands(e.state.component, e.state.params);
        this.addComponentCommands(e.state.component, e.state.params);
      }
    });
  }

  initCommandPalette() {
    this.cmpService.registerCommands(this.getCommandPaletteCommands()).subscribe((c: CommandPaletteCommand) => {
      if (c.id === 'logout') {
        this.frameService.appLogout();
      } else if (c.id === 'nav__intray') {
        this.router.navigate(['/result'], { queryParams: { query: this.frameService.pendingAFOsQuery, tmp: true } });
      } else if (c.id.startsWith('nav__')) {
        const tokens = c.id.split('__');
        this.router.navigate([tokens[1]]);
      } else if (c.id === 'settings__darkmode') {
        this.layoutService.setDarkMode(!this.layoutSettings.darkMode);
      }
    });
  }

  private getCommandPaletteCommands(): CommandPaletteCommand[] {
    const commands: CommandPaletteCommand[] = [
      { id: 'nav__dashboard', label: this.translate.instant('yuv.client.cmp.navigate.dashboard') },
      { id: 'nav__inbox', label: this.translate.instant('yuv.client.cmp.navigate.inbox') },
      { id: 'nav__settings', label: this.translate.instant('yuv.client.cmp.navigate.settings') },
      { id: 'nav__processes', label: this.translate.instant('yuv.client.cmp.navigate.processes') },
      { id: 'nav__follow-ups', label: this.translate.instant('yuv.client.cmp.navigate.follow-ups') },
      { id: 'nav__intray', label: this.translate.instant('yuv.client.cmp.navigate.intray') },

      { id: 'settings__darkmode', label: this.translate.instant('yuv.client.cmp.settings.darkmode') },
      { id: 'logout', label: this.translate.instant('yuv.client.cmp.navigate.logout') }
    ];
    return commands;
  }

  private addComponentCommands(component: string, params: ComponentStateParams) {
    switch (component) {
      case 'ObjectDetailsComponent': {
        this.addDmsObjectCommands(params.data as DmsObject);
        break;
      }
      case 'ContentPreviewComponent': {
        const commands = [];
        params.actions.forEach((a, i) => {
          commands.push({
            id: `contentpreviewcmp__a${i}`,
            label: a.label,
            callback: () => {
              a.callback();
            }
          });
        });
        this.cmpService.registerCommands(commands).subscribe();
        break;
      }
    }
  }

  private removeComponentCommands(component: string, params?: ComponentStateParams) {
    switch (component) {
      case 'ObjectDetailsComponent': {
        this.removeDmsObjectCommands();
        break;
      }
      case 'ContentPreviewComponent': {
        this.cmpService.unregisterCommands(params.actions.map((a, i) => `contentpreviewcmp__a${i}`));
        break;
      }
    }
  }

  // Add dms object related commands to the palette
  private addDmsObjectCommands(dmsObject: DmsObject) {
    const commands: CommandPaletteCommand[] = [];

    if (this.actionService.isExecutableSync('yuv-delete-action', dmsObject)) {
      commands.push({ id: `dmsobject__delete`, label: this.translate.instant('yuv.client.cmp.dmsobject.delete') });
    }

    // add some more commands for objects with content
    if (dmsObject.content) {
      commands.push({ id: `dmsobject__download`, label: this.translate.instant('yuv.client.cmp.dmsobject.download') });
    }

    this.registeredDmsObjectCommands = commands.map((c) => c.id);
    if (commands.length) {
      this.dmsObjectCommandSubscription = this.cmpService.registerCommands(commands).subscribe((c: CommandPaletteCommand) => {
        switch (c.id) {
          case 'dmsobject__download': {
            this.dmsService.downloadContent([dmsObject]);
            break;
          }
          case 'dmsobject__delete': {
            this.dmsService.deleteDmsObject(dmsObject.id).subscribe();
            break;
          }
        }
      });
    }
  }

  // Remove dms object related commands
  private removeDmsObjectCommands() {
    if (this.dmsObjectCommandSubscription) {
      this.dmsObjectCommandSubscription.unsubscribe();
      this.dmsObjectCommandSubscription = undefined;
    }
    this.cmpService.unregisterCommands(this.registeredDmsObjectCommands);
  }
}
