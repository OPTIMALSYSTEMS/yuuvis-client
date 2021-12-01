import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommandPaletteCommand, CommandPaletteService } from '@yuuvis/command-palette';
import { SystemService, TranslateService } from '@yuuvis/core';
import { FrameService } from './components/frame/frame.service';

@Component({
  selector: 'yuv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private system: SystemService,
    private router: Router,
    private frameService: FrameService,
    private cmpService: CommandPaletteService,
    private translate: TranslateService
  ) {
    this.translate.onLangChange.subscribe((_) => {
      this.cmpService.updateCommands(this.getCommandPaletteCommands());
    });
    this.initCommandPalette();
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
}
