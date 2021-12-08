import { Component } from '@angular/core';
import { AppCommandPaletteService } from './service/app-command-palette/app-command-palette.service';

@Component({
  selector: 'yuv-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(private appCommandPalette: AppCommandPaletteService) {
    this.appCommandPalette.initCommandPalette();
  }
}
