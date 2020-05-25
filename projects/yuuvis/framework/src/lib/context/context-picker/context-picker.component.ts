import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ENTER, ESCAPE, RIGHT_ARROW } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseObjectTypeField, DmsObject, DmsService, SearchQuery, SearchService, SecondaryObjectTypeField, SystemService, SystemType } from '@yuuvis/core';
import { debounceTime, map } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { IconRegistryService } from '../../common';
import { arrowNext, clear } from './../../svg.generated';
import { ContextFilterItem, ContextPickerItemComponent } from './context-picker-item/context-picker-item.component';

/**
 * Component that providees a picker to search and select a context folder.
 */
@Component({
  selector: 'yuv-context-picker',
  templateUrl: './context-picker.component.html',
  styleUrls: ['./context-picker.component.scss']
})
export class ContextPickerComponent implements OnInit, AfterViewInit, OnDestroy {
  private keyManager: ActiveDescendantKeyManager<ContextPickerItemComponent>;
  private query: SearchQuery;
  inputForm: FormGroup;
  details: DmsObject;
  result: ContextFilterItem[];

  @ViewChildren(ContextPickerItemComponent) items: QueryList<ContextPickerItemComponent>;
  @ViewChild('termInput') termInput;

  /**
   * Minimal number of characters to trigger search
   */
  @Input() minChars: number = 0;
  /**
   * Emitted once a context has been selected
   */
  @Output() contextSelect = new EventEmitter<string>();
  /**
   * Emitted when the user aborts picking a context
   */
  @Output() cancel = new EventEmitter<any>();

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    this.keyManager.onKeydown(event);
    if (this.keyManager.activeItemIndex >= 0) {
      const selectedItemId = this.result[this.keyManager.activeItemIndex].id;
      switch (event.keyCode) {
        case RIGHT_ARROW: {
          this.openDetails(selectedItemId);

          break;
        }
        case ESCAPE: {
          event.preventDefault();
          event.stopPropagation();
          if (this.details) {
            this.details = null;
          } else {
            this.cancel.emit();
          }
          break;
        }
        case ENTER: {
          this.contextSelect.emit(selectedItemId);
          break;
        }
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private iconRegistry: IconRegistryService,
    private dmsService: DmsService,
    private systemService: SystemService,
    private searchService: SearchService
  ) {
    this.query = new SearchQuery({
      fields: [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, SecondaryObjectTypeField.TITLE, SecondaryObjectTypeField.DESCRIPTION],
      types: [SystemType.FOLDER]
    });
    this.iconRegistry.registerIcons([clear, arrowNext]);
    this.inputForm = this.fb.group({
      term: []
    });
    this.inputForm.valueChanges.pipe(debounceTime(500)).subscribe((formValue) => {
      if (formValue.term.length > this.minChars) {
        this.query.term = `*${formValue.term}*`;
        this.fetchResult();
      } else {
        this.result = null;
      }
    });
  }

  private openDetails(id: string) {
    this.dmsService.getDmsObject(id).subscribe((r) => {
      this.details = r;
      this.termInput.nativeElement.focus();
    });
  }

  private fetchResult() {
    this.searchService
      .search(this.query)
      .pipe(
        map((r) =>
          r.items.map((i) => ({
            id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
            iconSVG: this.systemService.getObjectTypeIcon(BaseObjectTypeField.OBJECT_TYPE_ID),
            title: i.fields.get(SecondaryObjectTypeField.TITLE),
            description: i.fields.get(SecondaryObjectTypeField.DESCRIPTION)
          }))
        )
      )
      .subscribe(
        (r) => {
          this.result = r;
        },
        (e) => {
          console.error(e);
        }
      );
  }

  closeDetails() {
    this.details = null;
    this.termInput.elementRef.nativeElement.focus();
  }

  clickSelect(id) {
    const idx = this.result.findIndex((r) => r.id === id);
    if (idx >= 0) {
      this.keyManager.setActiveItem(idx);
    }
  }

  clear() {
    this.inputForm.patchValue({
      term: ''
    });
    this.termInput.nativeElement.focus();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {
    this.keyManager = new ActiveDescendantKeyManager(this.items).skipPredicate((item) => item.disabled).withWrap();
    this.keyManager.change.pipe(takeUntilDestroy(this)).subscribe((r) => console.log(r));
  }
}
