import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Catalog, CatalogService, Logger, TranslateService } from '@yuuvis/core';
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
export class DynamicCatalogManagementComponent {
  // collection of JSON Patch entries that could then be sent to the server
  patches = [];
  newEntryName: string;
  saving: boolean;
  error: string;

  @Input() catalog: Catalog;

  /**
   * Emitted when the catalog has been saved. Returns the updated catalog.
   */
  @Output() catalogSaved = new EventEmitter<Catalog>();
  @Output() cancel = new EventEmitter();

  constructor(private catalogService: CatalogService, private translate: TranslateService, private logger: Logger, private iconRegistry: IconRegistryService) {
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

  setDisabled(index: number, disabled: boolean): void {
    this.catalog.entries[index].disabled = disabled;
    this.patches.push({ op: 'replace', path: `/entries/${index}/disabled`, value: disabled });
  }

  addEntry() {
    if (this.newEntryName) {
      const e = { name: this.newEntryName, disabled: false };
      this.catalog.entries.push(e);
      this.patches.push({ op: 'add', path: `/entries/${this.catalog.entries.length - 1}`, value: e });
    }
    this.newEntryName = null;
  }

  save(): void {
    this.error = null;
    this.saving = true;
    this.catalogService.patch(this.catalog.name, this.patches, this.catalog.namespace).subscribe(
      (catalog: Catalog) => {
        this.catalogSaved.emit(catalog);
        this.saving = false;
      },
      (err) => {
        this.logger.error('Failed saving dynamic catalog', err);
        this.error = this.translate.instant('yuv.framework.dynamic-catalog-management.save.error');
        this.saving = false;
      }
    );
  }
}
