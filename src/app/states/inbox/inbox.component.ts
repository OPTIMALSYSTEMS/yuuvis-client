import { Component } from '@angular/core';
import { BpmService, PendingChangesService } from '@yuuvis/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent {
  layoutOptionsKey = 'yuv.app.inbox';
  objectDetailsID: string;

  inboxData$: Observable<any> = this.bpmService.getProcessInstances();
  constructor(private bpmService: BpmService, private pendingChanges: PendingChangesService) {}

  onSlaveClosed() {
    if (!this.pendingChanges.check()) {
      this.select([]);
    }
  }

  select(items: string[]) {
    // this.selectedItems = items;
    // this.objectDetailsID = this.selectedItems[0];
  }
}
