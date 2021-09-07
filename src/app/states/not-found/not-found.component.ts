import { Component, OnInit } from '@angular/core';
import { IconRegistryService } from '@yuuvis/framework';
import { error } from '../../../assets/default/svg/svg';

@Component({
  selector: 'yuv-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([error]);
  }

  ngOnInit() {}
}
