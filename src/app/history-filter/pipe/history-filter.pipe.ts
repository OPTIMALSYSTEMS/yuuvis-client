import { Pipe, PipeTransform } from '@angular/core';
import { WorkItemHistoryEntry } from '../../../../projects/yuuvis/core/src/public-api';
import { DmsObjectHistoryEntry } from '../../objectHistory/model/dms-object-history.model';

@Pipe({
  name: 'historyFilter'
})
export class HistoryFilterPipe implements PipeTransform {
  transform(value: any[], term?: any): any {
    if (!value || !term) {
      return value;
    }

    const searchTerm = term.toLowerCase();
    return value.filter(
      (item: WorkItemHistoryEntry & DmsObjectHistoryEntry) => {
        return (
          (this.check(item, 'title') &&
            item.title.toLowerCase().includes(searchTerm)) ||
          (this.check(item, 'description') &&
            item.description.toLowerCase().includes(searchTerm)) ||
          (this.check(item, 'performer') &&
            item.performer.some(u =>
              u.label.toLowerCase().includes(searchTerm)
            )) ||
          (this.check(item.user, 'name') &&
            item.user.name.toLowerCase().includes(searchTerm)) ||
          (this.check(item.user, 'lastname') &&
            item.user.lastname.toLowerCase().includes(searchTerm)) ||
          (this.check(item.user, 'firstname') &&
            item.user.firstname.toLowerCase().includes(searchTerm)) ||
          (this.check(item.parameter, 'processName') &&
            item.parameter.processName.toLowerCase().includes(searchTerm)) ||
          (this.check(item.parameter, 'activityName') &&
            item.parameter.activityName.toLowerCase().includes(searchTerm))
        );
      }
    );
  }

  check(item, leaf) {
    return item && item[leaf] && item[leaf].length > 0;
  }
}
