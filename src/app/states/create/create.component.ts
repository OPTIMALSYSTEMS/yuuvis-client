import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SystemService } from '@yuuvis/core';
import { ObjectTypePreset } from '@yuuvis/framework';
import { FrameService } from '../../components/frame/frame.service';

@Component({
  selector: 'yuv-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  host: { class: 'state-content-default' }
})
export class CreateComponent implements OnInit {
  context: string;
  files: File[];
  objectTypePreset: ObjectTypePreset;

  constructor(private location: Location, private system: SystemService, private frameService: FrameService, private route: ActivatedRoute) {}

  onObjectCreated(createdObjectsIds: string[]) {
    this.location.back();
  }

  ngOnInit() {
    this.context = this.route.snapshot.queryParamMap.get('context');
    if (this.route.snapshot.queryParamMap.has('filesRef')) {
      const files: File[] = this.frameService.getItem(this.route.snapshot.queryParamMap.get('filesRef'));
      if (files && files.length) {
        this.files = files;
      }
    }
    if (this.route.snapshot.queryParamMap.has('objectType')) {
      this.objectTypePreset = {
        objectType: this.system.getObjectType(decodeURIComponent(this.route.snapshot.queryParamMap.get('objectType'))),
        data: {}
      };
    }
  }
}
