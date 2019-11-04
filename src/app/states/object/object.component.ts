import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DmsObject, DmsService, EventService, YuvEventType } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-object',
  templateUrl: './object.component.html',
  styleUrls: ['./object.component.scss'],
  host: {
    class: 'state-content-default'
  }
})
export class ObjectComponent implements OnInit, OnDestroy {
  item: DmsObject;

  constructor(private route: ActivatedRoute, private dmsService: DmsService, private router: Router, private eventService: EventService) {}

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        this.dmsService.getDmsObject(params.id).subscribe((res: DmsObject) => {
          this.item = res;
        });
      }
    });

    this.eventService
      .on(YuvEventType.DMS_OBJECT_DELETED)
      .pipe(takeUntilDestroy(this))
      .subscribe(event => {
        if (this.item.id === event.data.id) {
          this.router.navigate(['/']);
        }
      });
  }

  ngOnDestroy() {}
}
