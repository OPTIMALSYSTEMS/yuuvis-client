import { Component, OnInit } from '@angular/core';
import { SVGIcons } from './../../../projects/yuuvis/framework/src/lib/svg.generated';

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

  icons = SVGIcons;

  title: string;
  description: string;

  constructor() {
    this.setRegularSizeTitle();
  }

  toggleBusy() {
    this.busy = !this.busy;
  }

  setRegularSizeTitle() {
    this.title = 'Pretty great title';
    this.description = 'damn good description';
  }

  setLongSizeTitle() {
    this.title = 'Sometimes someone will add a pretty long title string here that should not break the UI';
    this.description = 'Also ther is the possibility that descriptions will be as long as the long title string, who actually knows';
  }

  ngOnInit() {}
}
