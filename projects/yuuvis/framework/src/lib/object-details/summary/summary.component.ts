import { Component, Input } from '@angular/core';
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
    this.summary = data ? this.objectService.prepareData(data) : data;

    console.log('summary: ', this.summary);
  }

  constructor(private objectService: ObjectService) {}
}
