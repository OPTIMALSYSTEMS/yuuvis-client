import { Component, Input, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { IconRegistryService } from '@yuuvis/common-ui';
import { APP_VARS } from '../../app.vars';
import { error } from '../../../assets/default/svg/svg';

@Component({
  selector: 'yuv-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  @Input() description = 'eo.status.404.statesDescription';
  @Input() title = 'eo.status.404.title';

  constructor(private titleService: Title,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([error]);
}

  ngOnInit() {
    this.titleService.setTitle(APP_VARS.defaultPageTitle);
  }
}
