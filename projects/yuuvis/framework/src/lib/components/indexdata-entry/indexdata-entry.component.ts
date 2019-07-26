import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SystemService, TranslateService } from '@yuuvis/core';
import { LocaleDatePipe } from '../../pipes';

@Component({
  selector: 'yuv-indexdata-entry',
  templateUrl: './indexdata-entry.component.html',
  styleUrls: ['./indexdata-entry.component.scss']
})
export class IndexdataEntryComponent {
  _className = 'entry';
  _versions: boolean;
  data: any;

  @Input() label: string;
  @Input() value: any = { id: '', version: '', type: '' };
  @Input() innerValue: string;
  @Input()
  set item(item: any) {
    this.data = this.formatData(item);
    this.enableVersions = this.data['enaio:versionNumber'] ? true : false;
  }

  set enableVersions(version: boolean) {
    this._versions = version;
  }
  get enableVersions(): boolean {
    return this._versions;
  }

  @Input()
  set className(className) {
    this._className = `${this._className} ${className}`;
  }

  get className() {
    return this._className;
  }

  @Input() showEntry = true;
  @Output() valueClicked: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private translate: TranslateService,
    private systemService: SystemService
  ) {}

  private formatData(data: any) {
    const datePipe = new LocaleDatePipe(this.translate);
    data.key = this.systemService.getLocalizedResource(`${data.key}_label`);
    if (this.systemService.isDateFormat(data.value)) {
      data.value = datePipe.transform(data.value, 'eoShort');
    }
    return data;
  }

  onValueClick(event, item) {
    this.valueClicked.emit({ event, item });
  }
}
