import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
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
import { tap } from 'rxjs/operators';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { PopoverRef } from '../../../popover/popover.ref';
import { PopoverService } from '../../../popover/popover.service';
import { addCircle, attachment, clear, noFile } from '../../../svg.generated';

@Component({
  selector: 'yuv-task-details-attachments',
  templateUrl: './task-details-attachments.component.html',
  styleUrls: ['./task-details-attachments.component.scss']
})
export class TaskDetailsAttachmentsComponent implements OnInit {
  @ViewChild('addAttachmentOverlay') addAttachmentOverlay: TemplateRef<any>;

  private _task: Task;
  @Input() set task(t: Task) {
    this._task = t;
    if (t.attachments?.length) this.fetchAttachmentDetails(t.attachments);
  }
  _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(k: string) {
    this._layoutOptionsKey = `${k}.attachments`;
  }

  @Output() attachmentRemoved = new EventEmitter<string>();
  @Output() attachmentAdded = new EventEmitter<string>();

  attachedObjects: { id: string; objectTypeId: string; title: string }[] = [];
  selectedObject: string;
  busy: boolean;

  private popoverRef: PopoverRef;

  constructor(
    private searchService: SearchService,
    private popoverService: PopoverService,
    private inboxService: InboxService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([attachment, noFile, clear, addCircle]);
  }

  selectAttachment(id: string) {
    this.selectedObject = id;
  }

  removeAttachment(id: string) {
    this._task.attachments = this._task.attachments.filter((a) => a !== id);
    this.updateAttachments().subscribe((res) => {
      this.attachmentRemoved.emit(id);
    });
  }

  private updateAttachments() {
    return this.inboxService
      .updateTask(this._task.id, { attachments: this._task.attachments })
      .pipe(tap((_) => this.fetchAttachmentDetails(this._task.attachments)));
  }

  openAddAttachmentDialog() {
    this.popoverRef = this.popoverService.open(this.addAttachmentOverlay, {});
  }

  onAttachmentSelect(e) {
    this.popoverRef.close();
    this._task.attachments = [...(this._task.attachments ? this._task.attachments : []), e.id];
    this.updateAttachments().subscribe((res) => {
      this.attachmentRemoved.emit(e.id);
    });
  }

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
