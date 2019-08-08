import { Component, Input } from '@angular/core';
import {
  SystemService,
  TranslateService,
  UserService,
  Utils
} from '@yuuvis/core';
import { DisplayNamePipe, LocaleDatePipe } from '../../pipes';

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
            this.formatData({ key, value: data[key] })
          )
          .sort(Utils.sortValues('type'))
      : data;

    console.log(this.summary);
  }

  constructor(
    private translate: TranslateService,
    private systemService: SystemService,
    private userService: UserService
  ) {}

  private formatData(data: any): any {
    data.baseparams = this.systemService.getBaseTypeById(data.key)
      ? true
      : false;

    const datePipe = new LocaleDatePipe(this.translate);
    const displayNamePipe = new DisplayNamePipe(this.userService);

    if (['enaio:lastModifiedBy', 'enaio:createdBy'].includes(data.key)) {
      displayNamePipe
        .transform(data.value, 'Organization')
        .subscribe(val => (data.value = val));
    }

    data.key = this.systemService.getLocalizedResource(`${data.key}_label`);

    // this.systemService.getBaseTypePropertyTypeById(data.key) === 'daytime'
    if (this.systemService.isDateFormat(data.value)) {
      data.value = datePipe.transform(data.value, 'eoShort');
    }

    if (Array.isArray(data.value)) {
      data.value = data.value.join();
    }
    return data;
  }
}
