import { Attribute, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  BaseObjectTypeField,
  PendingChangesService,
  SearchFilter,
  SearchQuery,
  SearchResult,
  SearchService,
  SystemService,
  TranslateService
} from '@yuuvis/core';
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

  @Input() plugins: any;

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
  // list of types (object type IDs) that should not be offered when adding new attachments
  @Input() attachmentsSkipTypes: string[];

  @Output() attachmentRemove = new EventEmitter<string>();
  @Output() attachmentAdd = new EventEmitter<string>();
  @Output() attachmentOrderChange = new EventEmitter<string[]>();
  @Output() attachmentOpenExternal = new EventEmitter<string>();

  attachedObjects: ProcessAttachment[] = [];
  selectedObject: { id: string; leadingTypeId?: string; title?: string; error?: boolean };
  busy: boolean;

  private popoverRef: PopoverRef;

  constructor(
    @Attribute('keepPrimary') public keepPrimary: string,
    private translate: TranslateService,
    private system: SystemService,
    private iconRegistry: IconRegistryService,
    private searchService: SearchService,
    private popoverService: PopoverService,
    private pendingChanges: PendingChangesService
  ) {
    this.iconRegistry.registerIcons([dragHandle, sort, attachment, clear, noFile, addCircle]);
  }

  // select an attachmemnt from the attachments list to show its details
  selectAttachment(o: any, evt: MouseEvent) {
    if (!o?.error && evt?.ctrlKey) {
      this.attachmentOpenExternal.emit(o.id);
    }
    if (!this.pendingChanges.check()) this.selectedObject = o;
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
      width: '400px',
      // maxHeight: '70%',
      height: '350px'
    });
  }

  onAttachmentDialogSelect(e) {
    this.popoverRef.close();
    this.attachmentAdd.emit(e.id);
  }

  openOrderAttachmentDialog() {
    this.popoverRef = this.popoverService.open(this.orderAttachmentOverlay, {
      width: '400px',
      maxHeight: '70%'
    });
  }

  private fetchAttachmentDetails(oids: string[]) {
    if (oids?.length) {
      this.busy = true;
      const bp = this.system.getBaseProperties();

      const query = new SearchQuery({
        fields: [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.LEADING_OBJECT_TYPE_ID, bp.title]
      });
      query.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.IN, oids));

      this.searchService.search(query).subscribe({
        next: (res: SearchResult) => {
          // map result to maintain the correct order
          const qa: { [key: string]: any } = {};
          res.items.forEach((i) => {
            qa[i.fields.get(BaseObjectTypeField.OBJECT_ID)] = {
              id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
              leadingTypeId: i.fields.get(BaseObjectTypeField.LEADING_OBJECT_TYPE_ID),
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
              valid.preventRemove = this.keepPrimary === 'true';
            }
            this.selectedObject = valid || this.attachedObjects[0];
          }
          this.busy = false;
        },
        error: (err) => {
          // TODO: handle error
          this.busy = false;
        }
      });
    } else {
      this.attachedObjects = [];
    }
  }

  ngOnInit(): void {}
}
