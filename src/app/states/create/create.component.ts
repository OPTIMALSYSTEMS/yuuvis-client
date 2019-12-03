import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@yuuvis/core';

@Component({
  selector: 'yuv-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  host: { class: 'state-content-default' }
})
export class CreateComponent implements OnInit {
  constructor(private translate: TranslateService, private titleService: Title) {}

  ngOnInit() {
    this.titleService.setTitle(this.translate.instant('yuv.framework.object-create.header.title'));
  }
}
