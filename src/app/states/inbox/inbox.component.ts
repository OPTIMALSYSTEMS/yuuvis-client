import { Component } from '@angular/core';
import { InboxService, PendingChangesService, ProcessData, ProcessDefinitionKey } from '@yuuvis/core';
import { arrowNext, edit, IconRegistryService, listModeDefault, listModeGrid, listModeSimple, refresh, versions } from '@yuuvis/framework';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'yuv-inbox',
  templateUrl: './inbox.component.html',
  styleUrls: ['./inbox.component.scss']
})
export class InboxComponent {
  layoutOptionsKey = 'yuv.app.inbox';
  objectDetailsID: string;

  inboxData$: Observable<any> = this.inboxService.getInbox(ProcessDefinitionKey.FOLLOW_UP).pipe(map(this.formatDataTable));
  constructor(private inboxService: InboxService, private pendingChanges: PendingChangesService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([edit, arrowNext, refresh, versions, listModeDefault, listModeGrid, listModeSimple]);
  }

  private formatDataTable(processData: ProcessData[]) {
    const colDef = processData.map((data) => {
      const variables = data.variables.filter((variable) => variable.name !== 'initiator');
      variables.push({ name: 'type', value: data.name }, { name: 'businessKey', value: data.businessKey });
      const columnDefs = [];
      const rowData = [];

      variables.map((variable) => {
        columnDefs.push({ field: variable.name, headerClass: `col-header-type-${variable.name}`, headerName: variable.name });
        rowData.push({ [variable.name]: variable.value });
      });
      return [columnDefs, rowData];
    });
    const rows = colDef.map((col) => col[1].reduce((acc, row) => (acc = { ...acc, ...row })), {});
    return {
      columns: colDef[0][0],
      rows,
      titleField: 'data.processDefinitionName',
      descriptionField: 'data.processDefinitionDescription',
      selectType: 'single'
    };
  }

  onSlaveClosed() {
    if (!this.pendingChanges.check()) {
      this.select([]);
    }
  }

  onSelectionChanged(item) {
    console.log({ item });
  }

  select(items: string[]) {
    // this.selectedItems = items;
    // this.objectDetailsID = this.selectedItems[0];
  }
}
