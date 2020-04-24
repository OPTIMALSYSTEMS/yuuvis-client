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

  onContextRemoved() {
    // get rid of the fragment identifying the context
    this.router.navigate([]);
  }

  onObjectCreated(createdObjectsIds: string[]) {
    if (createdObjectsIds.length > 1) {
      this.location.back();
    } else {
      // TODO: remove timeout when backend returns synchroniously AFTER the object was created
      setTimeout(() => this.router.navigate(['object', createdObjectsIds[0]]), 1000);
    }
  }

  ngOnInit() {
    this.context = this.route.snapshot.paramMap.get('context');
    if (this.route.snapshot.paramMap.has('filesRef')) {
      const files: File[] = this.frameService.getItem(this.route.snapshot.paramMap.get('filesRef'));
      if (files && files.length) {
        this.files = files;
      }
    }
    this.titleService.setTitle(this.translate.instant('yuv.framework.object-create.header.title'));
  }
}
