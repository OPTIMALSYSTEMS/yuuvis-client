import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  BaseObjectTypeField,
  ClientDefaultsObjectTypeField,
  InboxService,
  SearchFilter,
  SearchFilterGroup,
  SearchQuery,
  SearchResult,
  SearchService,
  Task
} from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { attachment, clear, noFile } from '../../../svg.generated';

@Component({
  selector: 'yuv-task-details-attachments',
  templateUrl: './task-details-attachments.component.html',
  styleUrls: ['./task-details-attachments.component.scss']
})
export class TaskDetailsAttachmentsComponent implements OnInit {
  private _task: Task;
  @Input() set task(t: Task) {
    this._task = t;
    if (t.attachments?.length) this.fetchAttachmentDetails(t.attachments);
  }
  _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(k: string) {
    this._layoutOptionsKey = `${k}.attachments`;
  }

  @Output() attachmentRemove = new EventEmitter<string>();
  @Output() attachmentAdd = new EventEmitter();

  attachedObjects: { id: string; objectTypeId: string; title: string }[] = [];
  selectedObject: string;
  busy: boolean;

  constructor(private searchService: SearchService, private inboxService: InboxService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([attachment, noFile, clear]);
  }

  selectAttachment(id: string) {
    this.selectedObject = id;
  }

  removeAttachment(id: string) {
    this._task.attachments = this._task.attachments.filter((a) => a !== id);
    this.inboxService.updateTask(this._task.id, { attachments: this._task.attachments }).subscribe(
      (res) => console.log(res),
      (err) => console.error(err)
    );
  }

  addAttachment() {}

  private fetchAttachmentDetails(oids: string[]) {
    if (oids?.length) {
      this.busy = true;
      let query = new SearchQuery();
      query.fields = [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, ClientDefaultsObjectTypeField.TITLE];
      let group = SearchFilterGroup.fromArray(oids.map((id) => new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.EEQUAL, id)));
      group.operator = SearchFilterGroup.OPERATOR.OR;
      query.addFilterGroup(group);
      this.searchService.search(query).subscribe(
        (res: SearchResult) => {
          this.attachedObjects = res.items.map((i) => ({
            id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
            objectTypeId: i.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID),
            title: i.fields.get(ClientDefaultsObjectTypeField.TITLE)
          }));
          if (this.attachedObjects.length === 1) {
            this.selectedObject = this.attachedObjects[0].id;
          }
          this.busy = false;
        },
        (err) => {
          // TODO: handle error
          this.busy = false;
        }
      );
    } else {
      this.attachedObjects = [];
    }
  }

  ngOnInit(): void {}
}
