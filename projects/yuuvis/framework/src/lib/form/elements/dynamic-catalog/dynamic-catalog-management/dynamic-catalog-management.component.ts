import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Catalog, CatalogService, Logger, SystemService, TranslateService } from '@yuuvis/core';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { IconRegistryService } from '../../../../common/components/icon/service/iconRegistry.service';
import { PopoverService } from '../../../../popover/popover.service';
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
  @ViewChild('main') main: ElementRef;

  // collection of JSON Patch entries that could then be sent to the server
  patches = [];
  newEntryName: string;
  saving: boolean;
  error: string;
  entriesToBeRemoved: string[] = [];

  _catalog: Catalog;
  _catalogLabel: string;
  /**
   * This will enable the component to edit catalogs from an administrors
   * perspective. It will then use different endpoints to save the changes
   * after checking for the users permissions. Possible values are 'admin'
   * and 'system'.
   */
  @Input() scope: 'admin' | 'system';
  @Input() set catalog(c: Catalog) {
    // deep clone
    this._catalog = JSON.parse(JSON.stringify(c));
    this._catalogLabel = this.systemService.getLocalizedResource(this._catalog.qname) || this._catalog.qname;
  }

  /**
   * Emitted when the catalog has been saved. Returns the updated catalog.
   */
  @Output() catalogSaved = new EventEmitter<Catalog>();
  @Output() cancel = new EventEmitter();

  constructor(
    private catalogService: CatalogService,
    private popoverService: PopoverService,
    private translate: TranslateService,
    private systemService: SystemService,
    private logger: Logger,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([dragHandle, clear]);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this._catalog.entries, event.previousIndex, event.currentIndex);
    this.patches.push({ op: 'move', from: `/entries/${event.previousIndex}`, path: `/entries/${event.currentIndex}` });
  }

  remove(index: number) {
    this.entriesToBeRemoved.push(this._catalog.entries[index].name);
    this._catalog.entries.splice(index, 1);
    this.patches.push({ op: 'remove', path: `/entries/${index}` });
  }

  setDisabled(index: number, enabled: boolean): void {
    this._catalog.entries[index].disabled = !enabled;
    this.patches.push({ op: 'replace', path: `/entries/${index}/disabled`, value: !enabled });
  }

  addEntry() {
    if (this.newEntryName && !this._catalog.entries.find((e) => e.name === this.newEntryName)) {
      const e = { name: this.newEntryName, disabled: false };
      this._catalog.entries.push(e);
      this.patches.push({ op: 'add', path: `/entries/${this._catalog.entries.length - 1}`, value: e });
      this.scrollToBottom();
    }
    this.newEntryName = null;
  }

  scrollToBottom(): void {
    if (this.main) {
      setTimeout(() => {
        this.main.nativeElement.scrollTop = this.main.nativeElement.scrollHeight;
      });
    }
  }

  save(): void {
    this.error = null;
    this.saving = true;
    (this.entriesToBeRemoved.length ? this.catalogService.inUse(this._catalog.qname, this.entriesToBeRemoved) : of([]))
      .pipe(
        switchMap((inUse: string[]) =>
          inUse.length > 0
            ? this.popoverService.confirm({
                message: this.translate.instant('yuv.framework.dynamic-catalog-management.in-use.confirm.message', { inuse: inUse.join(', ') }),
                confirmLabel: this.translate.instant('yuv.framework.dynamic-catalog-management.in-use.confirm.ok')
              })
            : of(true)
        ),
        switchMap((proceed: boolean) => {
          if (proceed) {
            return this._catalog.tenant ? this.catalogService.patch(this._catalog.qname, this.patches) : this.catalogService.post(this._catalog, this.scope);
          } else {
            return of(null);
          }
        })
      )
      .subscribe(
        (catalog: Catalog) => {
          if (catalog) {
            this.catalogSaved.emit(catalog);
          } else {
            this.cancel.emit();
          }
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
