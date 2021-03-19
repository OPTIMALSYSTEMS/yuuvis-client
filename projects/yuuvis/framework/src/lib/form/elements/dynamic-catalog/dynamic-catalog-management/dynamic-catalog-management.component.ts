import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Catalog, CatalogService } from '@yuuvis/core';
import { IconRegistryService } from '../../../../common/components/icon/service/iconRegistry.service';
import { clear, dragHandle } from '../../../../svg.generated';

/**
 * Component for managing dynamic catalogs. This includes adding, removing and sorting entries
 * as well as creating new catalogs from existing ones.
 */
@Component({
  selector: 'yuv-dynamic-catalog-management',
  templateUrl: './dynamic-catalog-management.component.html',
  styleUrls: ['./dynamic-catalog-management.component.scss']
})
export class DynamicCatalogManagementComponent implements OnInit {
  // collection of JSON Patch entries that could then be sent to the server
  patches = [];

  @Input() catalog: Catalog;

  @Output() catalogSaved = new EventEmitter();
  @Output() cancel = new EventEmitter();

  constructor(private catalogService: CatalogService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([dragHandle, clear]);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.catalog.entries, event.previousIndex, event.currentIndex);
    this.patches.push({ op: 'move', from: `/entries/${event.previousIndex}`, path: `/entries/${event.currentIndex}` });
  }

  remove(index: number) {
    this.catalog.entries.splice(index, 1);
    this.patches.push({ op: 'remove', path: `/entries/${index}` });
  }

  setDisabled(): void {}

  ngOnInit(): void {}
}
