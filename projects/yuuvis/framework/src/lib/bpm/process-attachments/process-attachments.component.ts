import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  BaseObjectTypeField,
  ClientDefaultsObjectTypeField,
  SearchFilter,
  SearchFilterGroup,
  SearchQuery,
  SearchResult,
  SearchService,
  TranslateService
} from '@yuuvis/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { addCircle, attachment, clear, noFile } from '../../svg.generated';

@Component({
  selector: 'yuv-process-attachments',
  templateUrl: './process-attachments.component.html',
  styleUrls: ['./process-attachments.component.scss']
})
export class ProcessAttachmentsComponent implements OnInit {
  @ViewChild('addAttachmentOverlay') addAttachmentOverlay: TemplateRef<any>;

  @Input() set attachments(a: string[]) {
    if (a?.length) {
      this.fetchAttachmentDetails(a);
    } else {
      this.attachedObjects = [];
    }
  }
  @Input() enableAdd: boolean;
  @Input() enableRemove: boolean;
  @Input() attachmentPickerTitle: string;

  @Output() attachmentRemove = new EventEmitter<string>();
  @Output() attachmentAdd = new EventEmitter<string>();
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  attachedObjects: { id: string; objectTypeId: string; title: string }[] = [];
  selectedObject: string;
  busy: boolean;

  private popoverRef: PopoverRef;

  constructor(
    private translate: TranslateService,
    private iconRegistry: IconRegistryService,
    private searchService: SearchService,
    private popoverService: PopoverService
  ) {
    this.iconRegistry.registerIcons([attachment, clear, noFile, addCircle]);
  }

  // select an attachmemnt from the attachments list to show its details
  selectAttachment(id: string, evt: MouseEvent) {
    if (evt && evt.ctrlKey) {
      this.attachmentOpenExternal.emit(id);
    }
    this.selectedObject = id;
  }

  removeAttachment(id: string) {
    this.popoverService
      .confirm({
        message: this.translate.instant('yuv.framework.task-details-attachments.dialog.remove.message')
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.attachmentRemove.emit(id);
        }
      });
  }

  openAddAttachmentDialog() {
    this.popoverRef = this.popoverService.open(this.addAttachmentOverlay, {});
  }

  onAttachmentSelect(e) {
    this.popoverRef.close();
    this.attachmentAdd.emit(e.id);
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
          if (this.attachedObjects.length > 0) {
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
