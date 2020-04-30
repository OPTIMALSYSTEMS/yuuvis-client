import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@yuuvis/core';
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

  constructor(
    private translate: TranslateService,
    private location: Location,
    private frameService: FrameService,
    private router: Router,
    private route: ActivatedRoute,
    private titleService: Title
  ) {}

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
    this.titleService.setTitle(this.translate.instant('yuv.framework.object-create.header.title'));
  }
}
