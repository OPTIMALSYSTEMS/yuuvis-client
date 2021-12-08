import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommandPaletteCommand, CommandPaletteService } from '@yuuvis/command-palette';
import {
  BaseObjectTypeField,
  ClientDefaultsObjectTypeField,
  DmsObject,
  DmsService,
  PendingChangesService,
  SearchQuery,
  SearchResult,
  SearchService,
  SystemService,
  TranslateService
} from '@yuuvis/core';
import { ComponentStateChangeEvent, ComponentStateService } from '@yuuvis/framework';
import { Subscription } from 'rxjs';
import { FrameService } from './components/frame/frame.service';

@Component({
  selector: 'yuv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private DISABLED_CAUSE_KEY = 'cmp.disabled.cause.pending.';
  private dmsObjectCommandSubscription: Subscription;

  constructor(
    private system: SystemService,
    private router: Router,
    private searchService: SearchService,
    private pendingChangesService: PendingChangesService,
    private frameService: FrameService,
    private dmsService: DmsService,
    private cmpService: CommandPaletteService,
    private componentStateService: ComponentStateService,
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe((_) => {
      this.cmpService.updateCommands(this.getCommandPaletteCommands());
    });
    this.initCommandPalette();

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
            fields: [BaseObjectTypeField.OBJECT_ID, ClientDefaultsObjectTypeField.TITLE, ClientDefaultsObjectTypeField.DESCRIPTION]
          })
        )
        .subscribe((res: SearchResult) => {
          cb(
            res.items.map((i) => ({
              id: `sr__${i.fields.get(BaseObjectTypeField.OBJECT_ID)}`,
              label: i.fields.get(ClientDefaultsObjectTypeField.TITLE),
              description: i.fields.get(ClientDefaultsObjectTypeField.DESCRIPTION)
            }))
          );
        });
    };

    // listen to components state changes to add new commands based on them
    this.componentStateService.componentStateChange$.subscribe((e: ComponentStateChangeEvent) => {
      if (e.action === 'add') {
        if (e.state.component === 'ObjectDetailsComponent') {
          this.addDmsObjectCommands(e.state.data as DmsObject);
        }
      } else if (e.action === 'remove') {
        this.removeDmsObjectCommands();
      } else if (e.action === 'update') {
        this.removeDmsObjectCommands();
        this.addDmsObjectCommands(e.state.data as DmsObject);
      }
    });
  }

  private initCommandPalette() {
    this.cmpService.registerCommands(this.getCommandPaletteCommands()).subscribe((c: CommandPaletteCommand) => {
      if (c.id === 'logout') {
        this.frameService.appLogout();
      } else if (c.id.startsWith('nav__')) {
        const tokens = c.id.split('__');
        this.router.navigate([tokens[1]]);
      } else if (c.id.startsWith('create__')) {
        const tokens = c.id.split('__');
        const objectTypeID = tokens[1];
        this.router.navigate(['create'], {
          queryParams: {
            objectType: encodeURIComponent(objectTypeID)
          }
        });
      }
    });
  }

  private getCommandPaletteCommands(): CommandPaletteCommand[] {
    const commands: CommandPaletteCommand[] = [
      { id: 'nav__dashboard', label: this.translate.instant('yuv.client.cmp.navigate.dashboard') },
      { id: 'nav__inbox', label: this.translate.instant('yuv.client.cmp.navigate.inbox') },
      { id: 'nav__settings', label: this.translate.instant('yuv.client.cmp.navigate.settings') },
      { id: 'logout', label: this.translate.instant('yuv.client.cmp.navigate.logout') }
    ];

    this.system.getObjectTypes(true, 'create').forEach((t) => {
      commands.push({
        id: `create__${t.id}`,
        label: `Create: ${t.label}`
      });
    });

    return commands;
  }

  private addDmsObjectCommands(dmsObject: DmsObject) {
    const commands: CommandPaletteCommand[] = [{ id: `dmsobject__download`, label: this.translate.instant('yuv.client.cmp.dmsobject.download') }];

    this.dmsObjectCommandSubscription = this.cmpService.registerCommands(commands).subscribe((c: CommandPaletteCommand) => {
      if (c.id === `dmsobject__download`) {
        this.dmsService.downloadContent([dmsObject]);
      }
    });
  }

  private removeDmsObjectCommands() {
    if (this.dmsObjectCommandSubscription) {
      this.dmsObjectCommandSubscription.unsubscribe();
      this.dmsObjectCommandSubscription = undefined;
    }
    this.cmpService.unregisterCommands([`dmsobject__download`]);
  }
}
