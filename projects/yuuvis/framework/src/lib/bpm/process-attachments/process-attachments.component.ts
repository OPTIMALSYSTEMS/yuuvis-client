import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { BaseObjectTypeField, SearchFilter, SearchFilterGroup, SearchQuery, SearchResult, SearchService, SystemService, TranslateService } from '@yuuvis/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { addCircle, attachment, clear, dragHandle, noFile, sort } from '../../svg.generated';
import { ProcessAttachment } from './process-attachments.interface';

@Component({
  selector: 'yuv-process-attachments',
  templateUrl: './process-attachments.component.html',
  styleUrls: ['./process-attachments.component.scss']
})
export class ProcessAttachmentsComponent implements OnInit {
  @ViewChild('addAttachmentOverlay') addAttachmentOverlay: TemplateRef<any>;
  @ViewChild('orderAttachmentOverlay') orderAttachmentOverlay: TemplateRef<any>;

  @Input() set attachments(a: string[]) {
    if (a?.length) {
      this.fetchAttachmentDetails(a);
    } else {
      this.attachedObjects = [];
    }
  }
  @Input() enableAdd: boolean;
  @Input() enableOrder: boolean;
  @Input() enableRemove: boolean;
  @Input() attachmentPickerTitle: string;
  _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(k: string) {
    this._layoutOptionsKey = `${k}.attachments`;
  }

  @Output() attachmentRemove = new EventEmitter<string>();
  @Output() attachmentAdd = new EventEmitter<string>();
  @Output() attachmentOrderChange = new EventEmitter<string[]>();
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  attachedObjects: ProcessAttachment[] = [];
  selectedObject: string;
  busy: boolean;

  private popoverRef: PopoverRef;

  constructor(
    private translate: TranslateService,
    private system: SystemService,
    private iconRegistry: IconRegistryService,
    private searchService: SearchService,
    private popoverService: PopoverService
  ) {
    this.iconRegistry.registerIcons([dragHandle, sort, attachment, clear, noFile, addCircle]);
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
    this.popoverRef = this.popoverService.open(this.addAttachmentOverlay, {
      minWidth: 350,
      maxHeight: '70%'
    });
  }

  onAttachmentDialogSelect(e) {
    this.popoverRef.close();
    this.attachmentAdd.emit(e.id);
  }

  openOrderAttachmentDialog() {
    this.popoverRef = this.popoverService.open(this.orderAttachmentOverlay, {
      minWidth: 350,
      maxHeight: '70%'
    });
  }

  private fetchAttachmentDetails(oids: string[]) {
    if (oids?.length) {
      this.busy = true;
      const bp = this.system.getBaseProperties();

      let query = new SearchQuery();
      query.fields = [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, bp.title];
      let group = SearchFilterGroup.fromArray(oids.map((id) => new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.EEQUAL, id)));
      group.operator = SearchFilterGroup.OPERATOR.OR;
      query.addFilterGroup(group);
      this.searchService.search(query).subscribe(
        (res: SearchResult) => {
          // map result to maintain the correct order
          const qa: { [key: string]: any } = {};
          res.items.forEach((i) => {
            qa[i.fields.get(BaseObjectTypeField.OBJECT_ID)] = {
              id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
              objectTypeId: i.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID),
              title: i.fields.get(bp.title)
            };
          });
          this.attachedObjects = oids.map((id) => {
            // some of the attachments may not be resolved due to a lack of permissions
            return qa[id]
              ? qa[id]
              : {
                  id: id,
                  error: true
                };
          });
          if (this.attachedObjects.length > 0) {
            // select the first item that has no error
            const valid = this.attachedObjects.find((o) => !o.error);
            if (valid) {
              this.selectedObject = valid.id;
            }
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
