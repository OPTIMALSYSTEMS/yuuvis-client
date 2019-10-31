import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DmsObject, DmsService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-object',
  templateUrl: './object.component.html',
  styleUrls: ['./object.component.scss']
})
export class ObjectComponent implements OnInit, OnDestroy {
  item: DmsObject;

  constructor(private route: ActivatedRoute, private dmsService: DmsService) {}

  ngOnInit() {
    this.route.params.pipe(takeUntilDestroy(this)).subscribe((params: any) => {
      if (params.id) {
        this.dmsService.getDmsObject(params.id).subscribe((res: DmsObject) => {
          this.item = res;
        });
      }
    });
  }

  ngOnDestroy() {}
}
