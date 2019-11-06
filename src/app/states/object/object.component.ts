import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppCacheService, DmsObject, DmsService, EventService, YuvEventType } from '@yuuvis/core';
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
  private STORAGE_KEY = 'yuv.app.object';
  item: DmsObject;

  private options = {
    'yuv-object-details': null
  };

  constructor(
    private route: ActivatedRoute,
    private dmsService: DmsService,
    private router: Router,
    private eventService: EventService,
    private appCacheService: AppCacheService
  ) {}

  onOptionsChanged(options: any, component: string) {
    // console.log(options, component);
    this.options[component] = options;
    this.appCacheService.setItem(this.getStorageKey(), this.options).subscribe();
  }

  getOptions(component: string) {
    return this.options[component];
  }

  private getStorageKey() {
    return this.item ? `${this.STORAGE_KEY}.${this.item.objectTypeId}` : this.STORAGE_KEY;
  }

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        this.dmsService.getDmsObject(params.id).subscribe((res: DmsObject) => {
          this.item = res;
          this.appCacheService.getItem(this.getStorageKey()).subscribe(o => (this.options = { ...this.options, ...o }));
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
