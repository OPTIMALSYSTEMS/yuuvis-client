import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateService } from '@yuuvis/core';
import { ViewMode } from '../../components';

@Component({
  selector: 'yuv-process-list',
  templateUrl: './process-list.component.html',
  styleUrls: ['./process-list.component.scss']
})
export class ProcessListComponent {
  layoutOptionsKey = 'yuv.app.process';
  private _processData: any;
  viewMode: ViewMode;
  header: { title: string; description: string; icon: string };

  @Input()
  set processData(data) {
    data.currentViewMode = 'horizontal';
    this._processData = data;
  }
  get processData() {
    return this._processData;
  }

  @Input()
  set headerDetails({ title, description, icon }: { title: string; description: string; icon: string }) {
    this.header = {
      title: this.translateService.instant(title),
      description: this.translateService.instant(description),
      icon
    };

    console.log(this.header);
    console.log({ title, description, icon });
  }

  @Output() selectedItem: EventEmitter<any> = new EventEmitter<any>();
  @Output() refreshList: EventEmitter<any> = new EventEmitter<any>();

  constructor(private translateService: TranslateService) {}

  select(event) {
    console.log(event);

    this.selectedItem.emit(event);
  }

  refresh() {
    this.refreshList.emit();
  }
}
