import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, QueryList, TemplateRef, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseObjectTypeField, Logger, SearchQuery, SearchService, SecondaryObjectTypeField, SystemService } from '@yuuvis/core';
import { debounceTime, map } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { arrowNext, clear } from './../../svg.generated';
import { QuickfinderEntry, QuickfinderEntryComponent } from './quickfinder-entry/quickfinder-entry.component';

/**
 * Picker for quickly selecting an object.
 */
@Component({
  selector: 'yuv-quickfinder',
  templateUrl: './quickfinder.component.html',
  styleUrls: ['./quickfinder.component.scss']
})
export class QuickfinderComponent implements OnDestroy {
  private keyManager: ActiveDescendantKeyManager<QuickfinderEntryComponent>;
  private query: SearchQuery;
  private popoverRef: PopoverRef;

  inputForm: FormGroup;
  selectedEntry: QuickfinderEntry;
  result: QuickfinderEntry[];
  busy: boolean;

  @ViewChildren(QuickfinderEntryComponent) items: QueryList<QuickfinderEntryComponent>;
  @ViewChild('termInput') termInput;
  @ViewChild('tplPicker') tplPicker: TemplateRef<any>;

  /**
   * Label for the quickfinder
   */
  @Input() label: string;
  /**
   * Minimal number of characters to trigger search (default: 2)
   */
  @Input() minChars: number = 2;
  /**
   * Maximal number of suggestions for the given search term (default: 10)
   */
  @Input() maxSuggestions: number = 10;

  /**
   * Restrict the suggestions to a list of allowed target object types
   */
  @Input() allowedTargetTypes: string[] = [];

  /**
   * You can provide a template reference here that will be rendered at the end of each
   * quickfinder result item. Within the provided template you'll get an object
   * representing the current entry:
   *
   * ```html
   * <ng-template #quickfinderEntryLinkTpl let-entry="entry">
   *   <a [routerLink]="['/context', entry.id]" title="Open '{{entry.title}}'">open</a>
   * </ng-template>
   * ```
   *
   * Use case: Add a router link of your host application that opens
   * the object in a new tab/window.
   */
  @Input() entryLinkTemplate: TemplateRef<any>;

  /**
   * Emitted once an object has been selected
   */
  @Output() objectSelect = new EventEmitter<QuickfinderEntry>();

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    if (this.keyManager) {
      this.keyManager.onKeydown(event);
      if (this.result && this.keyManager.activeItemIndex >= 0) {
        switch (event.keyCode) {
          case ENTER: {
            this.selectEntry(this.result[this.keyManager.activeItemIndex]);
            break;
          }
        }
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private logger: Logger,
    private elRef: ElementRef,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService,
    private systemService: SystemService,
    private searchService: SearchService
  ) {
    this.iconRegistry.registerIcons([clear, arrowNext]);
    this.inputForm = this.fb.group({
      term: []
    });
    this.inputForm.valueChanges.pipe(takeUntilDestroy(this), debounceTime(500)).subscribe((formValue) => {
      if (formValue.term.length >= this.minChars) {
        this.query.term = `*${formValue.term}*`;
        this.fetchResult();
      } else {
        this.result = null;
      }
    });
  }

  private fetchResult() {
    this.busy = true;
    this.searchService
      .search(this.query)
      .pipe(
        map((r) =>
          r.items.map((i) => ({
            id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
            iconSVG: this.systemService.getObjectTypeIcon(i.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID)),
            title: i.fields.get(SecondaryObjectTypeField.TITLE),
            description: i.fields.get(SecondaryObjectTypeField.DESCRIPTION)
          }))
        )
      )
      .subscribe(
        (r) => {
          this.result = r;
          if (this.result && this.result.length) {
            if (!this.popoverRef) {
              this.popoverRef = this.popoverService.open(
                this.tplPicker,
                {
                  maxWidth: '250px',
                  backdropClass: 'invisible'
                },
                this.elRef
              );
              // need timeout here because the items handled by the keyManager
              // will be rendered right now and therefor not be part of the DOM
              setTimeout(() => {
                this.keyManager = new ActiveDescendantKeyManager(this.items).withWrap();
              }, 0);
              const sub = this.popoverRef.afterClosed().subscribe((_) => {
                sub.unsubscribe();
                this.popoverRef = null;
                this.keyManager = null;
              });
            }
          } else if (this.popoverRef) {
            this.popoverRef.close();
          }
        },
        (e) => {
          this.logger.error(e);
        },
        () => (this.busy = false)
      );
  }

  selectEntry(entry: QuickfinderEntry) {
    this.selectedEntry = entry;
    this.objectSelect.emit(this.selectedEntry);
    this.popoverRef.close();
  }

  clear() {
    this.selectedEntry = null;
    this.inputForm.patchValue({
      term: ''
    });
    setTimeout(() => {
      this.termInput.nativeElement.focus();
    }, 0);
  }

  ngOnInit(): void {
    this.query = new SearchQuery({
      fields: [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, SecondaryObjectTypeField.TITLE, SecondaryObjectTypeField.DESCRIPTION],
      types: this.allowedTargetTypes,
      size: this.maxSuggestions
    });
  }

  ngOnDestroy(): void {
    // takeUntilDestroy
  }
}
