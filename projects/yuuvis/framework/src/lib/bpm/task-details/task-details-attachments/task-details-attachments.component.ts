import { Component, Input, OnInit } from '@angular/core';
import { BaseObjectTypeField, ClientDefaultsObjectTypeField, SearchFilter, SearchFilterGroup, SearchQuery, SearchResult, SearchService } from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { attachment, noFile } from '../../../svg.generated';

@Component({
  selector: 'yuv-task-details-attachments',
  templateUrl: './task-details-attachments.component.html',
  styleUrls: ['./task-details-attachments.component.scss']
})
export class TaskDetailsAttachmentsComponent implements OnInit {
  @Input() set objectIDs(oids: string[]) {
    this.fetchAttachmentDetails(oids);
  }
  _layoutOptionsKey: string;
  @Input() set layoutOptionsKey(k: string) {
    this._layoutOptionsKey = `${k}.attachments`;
  }
  attachedObjects: { id: string; objectTypeId: string; title: string }[] = [];
  selectedObject: string;
  busy: boolean;

  constructor(private searchService: SearchService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([attachment, noFile]);
  }

  selectAttachment(id: string) {
    this.selectedObject = id;
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
