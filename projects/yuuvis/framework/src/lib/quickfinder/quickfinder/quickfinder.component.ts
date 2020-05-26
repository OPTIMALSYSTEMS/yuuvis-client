import { ActiveDescendantKeyManager } from '@angular/cdk/a11y';
import { ENTER } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren
} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseObjectTypeField, DmsObject, SearchQuery, SearchService, SecondaryObjectTypeField, SystemService, SystemType } from '@yuuvis/core';
import { debounceTime, map } from 'rxjs/operators';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { arrowNext, clear } from './../../svg.generated';
import { QuickfinderEntry, QuickfinderEntryComponent } from './quickfinder-entry/quickfinder-entry.component';

/**
 *
 */
@Component({
  selector: 'yuv-quickfinder',
  templateUrl: './quickfinder.component.html',
  styleUrls: ['./quickfinder.component.scss']
})
export class QuickfinderComponent implements OnInit, AfterViewInit, OnDestroy {
  private keyManager: ActiveDescendantKeyManager<QuickfinderEntryComponent>;
  private query: SearchQuery;
  inputForm: FormGroup;
  details: DmsObject;
  result: QuickfinderEntry[];
  private popoverRef: PopoverRef;

  @ViewChildren(QuickfinderEntryComponent) items: QueryList<QuickfinderEntryComponent>;
  @ViewChild('termInput') termInput;
  @ViewChild('tplPicker') tplPicker: TemplateRef<any>;

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
  @Input() allowedTargetTypes: string[] = [SystemType.OBJECT];
  /**
   * You can provide a template reference here that will be rendered at the end of each
   * quickfinder item. Use case: Add a router link of your host application that opens
   * the object in a new tab/window.
   */
  @Input() detailsLinkTemplate: TemplateRef<any>;

  /**
   * Emitted once an object has been selected
   */
  @Output() objectSelect = new EventEmitter<string>();

  // @Output() cancel = new EventEmitter<any>();

  @HostListener('keydown', ['$event']) onKeyDown(event) {
    this.keyManager.onKeydown(event);
    if (this.result && this.keyManager.activeItemIndex >= 0) {
      const selectedItemId = this.result[this.keyManager.activeItemIndex].id;
      switch (event.keyCode) {
        // case ESCAPE: {
        //   event.preventDefault();
        //   event.stopPropagation();
        //   if (this.details) {
        //     this.details = null;
        //   } else {
        //     this.cancel.emit();
        //   }
        //   break;
        // }
        case ENTER: {
          this.objectSelect.emit(selectedItemId);
          this.popoverRef.close();
          break;
        }
      }
    }
  }

  constructor(
    private fb: FormBuilder,
    private elRef: ElementRef,
    private popoverService: PopoverService,
    private iconRegistry: IconRegistryService,
    private systemService: SystemService,
    private searchService: SearchService
  ) {
    this.query = new SearchQuery({
      fields: [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, SecondaryObjectTypeField.TITLE, SecondaryObjectTypeField.DESCRIPTION],
      types: this.allowedTargetTypes,
      size: this.maxSuggestions
    });
    this.iconRegistry.registerIcons([clear, arrowNext]);
    this.inputForm = this.fb.group({
      term: []
    });
    this.inputForm.valueChanges.pipe(debounceTime(500)).subscribe((formValue) => {
      if (formValue.term.length >= this.minChars) {
        this.query.term = `*${formValue.term}*`;
        this.fetchResult();
      } else {
        this.result = null;
      }
    });
  }

  private fetchResult() {
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
          console.log(this.popoverRef);
          if (!this.popoverRef) {
            this.popoverRef = this.popoverService.open(this.tplPicker, {}, this.elRef);
            const sub = this.popoverRef.afterClosed().subscribe((_) => {
              sub.unsubscribe();
              this.popoverRef = null;
            });
          }
        },
        (e) => {
          console.error(e);
        }
      );
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

  onPickerResult(objectId: string, popoverRef?: PopoverRef) {
    console.log('Got context ID', objectId);
    if (popoverRef) {
      popoverRef.close();
    }
  }

  // onPickerCancel(popoverRef?: PopoverRef) {
  //   if (popoverRef) {
  //     popoverRef.close();
  //   }
  // }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  ngAfterViewInit(): void {
    this.keyManager = new ActiveDescendantKeyManager(this.items).skipPredicate((item) => item.disabled).withWrap();
  }
}
