import { Component, OnInit } from '@angular/core';
import { IconRegistryService } from '@yuuvis/framework';
import { favorite, finalized, kebap, lock, refresh, resubmission, subscription } from './../../../projects/yuuvis/framework/src/lib/svg.generated';

@Component({
  selector: 'yuv-test-panel',
  templateUrl: './test-panel.component.html',
  styleUrls: ['./test-panel.component.scss']
})
export class TestPanelComponent implements OnInit {
  busy: boolean;
  showIcon: boolean = true;
  showActions: boolean = true;
  showStatus: boolean = true;
  showFooter: boolean = false;

  title: string;
  description: string;

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([favorite, refresh, kebap, subscription, resubmission, lock, finalized]);
    this.setRegularSizeTitle();
  }

  toggleBusy() {
    this.busy = !this.busy;
  }

  setRegularSizeTitle() {
    this.title = 'Lorem ipsum';
    this.description = 'Cras ut ex eu mi suscipit finibus';
  }

  setLongSizeTitle() {
    this.title = 'Sometimes someone will add a pretty long title string here that should not break the UI';
    this.description = 'Also ther is the possibility that descriptions will be as long as the long title string, who actually knows';
  }

  ngOnInit() {}
}
