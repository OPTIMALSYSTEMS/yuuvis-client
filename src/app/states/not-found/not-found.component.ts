import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { APP_VARS } from '../../app.vars';

@Component({
  selector: 'yuv-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  constructor(private titleService: Title) {}

  ngOnInit() {
    this.titleService.setTitle(APP_VARS.defaultPageTitle);
  }
}
