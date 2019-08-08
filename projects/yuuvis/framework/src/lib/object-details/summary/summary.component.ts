import { Component, Input } from '@angular/core';
import { Sort, Utils } from '@yuuvis/core';
import { ObjectService } from '../../services/object-data/object.service';

@Component({
  selector: 'yuv-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent {
  summary: any;

  @Input()
  set summaryData(data: any) {
    this.summary = data
      ? Object.keys(data)
          .map((key: string, index: number) =>
            this.objectService.formatData({ key, value: data[key] })
          )
          .sort(Utils.sortValues('baseparams', Sort.ASC))
      : data;
  }

  constructor(private objectService: ObjectService) {}
}
