import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@yuuvis/core';

@Component({
  selector: 'yuv-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  host: { class: 'state-content-default' }
})
export class CreateComponent implements OnInit {
  context: string;

  constructor(
    private translate: TranslateService,
    private location: Location,
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
    this.context = this.route.snapshot.fragment;
    this.titleService.setTitle(this.translate.instant('yuv.framework.object-create.header.title'));
  }
}
