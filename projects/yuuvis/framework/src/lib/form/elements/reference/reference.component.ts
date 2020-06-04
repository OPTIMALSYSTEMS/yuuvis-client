import { Component, EventEmitter, forwardRef, HostBinding, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  BaseObjectTypeField,
  Classification,
  ClassificationEntry,
  SearchFilter,
  SearchQuery,
  SearchQueryProperties,
  SearchResult,
  SearchService,
  SecondaryObjectTypeField,
  SystemService
} from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { reference } from '../../../svg.generated';
import { ReferenceEntry } from './reference.interface';

/**
 * Creates a form element for adding references to other dms objects.
 *
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 * @example
 * <yuv-reference (objectSelect)="referencesChanges($event)"></yuv-reference>
 */
@Component({
  selector: 'yuv-reference',
  templateUrl: './reference.component.html',
  styleUrls: ['./reference.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ReferenceComponent),
      multi: true
    }
  ]
})
export class ReferenceComponent implements ControlValueAccessor {
  @ViewChild('autocomplete') autoCompleteInput: AutoComplete;
  private queryJson: SearchQueryProperties;
  noAccessTitle = '! *******';

  minLength = 2;

  value;
  innerValue: ReferenceEntry[] = [];
  autocompleteRes: any[] = [];

  @HostBinding('class.inputDisabled') _inputDisabled: boolean;
  /**
   * Possibles values are `EDIT` (default),`SEARCH`,`CREATE`. In search situation validation of the form element will be turned off, so you are able to enter search terms that do not meet the elements validators.
   */
  @Input() situation: string;
  /**
   * Indicator that multiple strings could be inserted, they will be rendered as chips (default: false).
   */
  @Input() multiselect: boolean;
  /**
   * Additional semantics for the form element. You could specify restrictions on what object
   * type should be allowed by setting eg. `['id:reference[system:folder]']` to only allow folders
   */
  @Input() set classification(c: string[]) {
    const ce: ClassificationEntry = this.systemService.getClassifications(c).get(Classification.STRING_REFERENCE);
    if (ce && ce.options) {
      this.allowedTargetTypes = ce.options;
    }
  }
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;
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
   * Minimal number of characters to trigger search (default: 2)
   */
  @Input() minChars: number = 2;
  /**
   * Maximal number of suggestions for the given search term (default: 10)
   */
  @Input() maxSuggestions: number = 10;

  /**
   * Restrict the suggestions to a list of allowed target object types.
   */
  @Input() allowedTargetTypes: string[] = [];

  /**
   * Emitted once an object has been selected
   */
  @Output() objectSelect = new EventEmitter<ReferenceEntry[]>();

  constructor(private iconRegistry: IconRegistryService, private systemService: SystemService, private searchService: SearchService) {
    this.iconRegistry.registerIcons([reference]);
  }
  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    if (value) {
      this.value = value;
      this.resolveFn(value);
    } else {
      this.value = null;
      this.innerValue = [];
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  private propagate() {
    this._inputDisabled = !this.multiselect && this.innerValue.length === 1;
    this.propagateChange(this.value);
    this.objectSelect.emit(this.innerValue);
  }

  private resolveFn(value: any) {
    const tasks: Observable<any>[] = [];
    const resolveIds: string[] = [];
    (value instanceof Array ? value : [value]).forEach((v) => {
      let match = this.innerValue.find((iv) => iv.id === v);
      if (match) {
        tasks.push(of(match));
      } else {
        resolveIds.push(v);
      }
    });
    if (resolveIds.length) {
      tasks.push(this.resolveRefEntries(resolveIds));
    }
    return forkJoin(tasks).subscribe((data) => {
      this.innerValue = [].concat(...data);
    });
  }

  private resolveRefEntries(ids: string[]): Observable<ReferenceEntry[]> {
    const q = new SearchQuery();
    q.fields = [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, SecondaryObjectTypeField.TITLE, SecondaryObjectTypeField.DESCRIPTION];
    q.addFilter(new SearchFilter(BaseObjectTypeField.OBJECT_ID, SearchFilter.OPERATOR.IN, ids));
    return this.searchService.search(q).pipe(
      map((res: SearchResult) => {
        if (ids.length !== res.items.length) {
          // some of the IDs could not be retrieved (no permission or deleted)
          const x = {};
          res.items.forEach((r) => (x[r.fields.get(BaseObjectTypeField.OBJECT_ID)] = r));
          return ids.map((id) => ({
            id: id,
            iconSVG: x[id] ? this.systemService.getObjectTypeIcon(x[id].fields.get(BaseObjectTypeField.OBJECT_TYPE_ID)) : null,
            title: x[id] ? x[id].fields.get(SecondaryObjectTypeField.TITLE) : this.noAccessTitle,
            description: x[id] ? x[id].fields.get(SecondaryObjectTypeField.DESCRIPTION) : null
          }));
        } else {
          return res.items.map((i) => ({
            id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
            iconSVG: this.systemService.getObjectTypeIcon(i.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID)),
            title: i.fields.get(SecondaryObjectTypeField.TITLE),
            description: i.fields.get(SecondaryObjectTypeField.DESCRIPTION)
          }));
        }
      })
    );
  }

  autocompleteFn(evt) {
    if (evt.query.length >= this.minLength) {
      this.searchService
        .search(new SearchQuery({ ...this.queryJson, term: `*${evt.query}*` }))
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
            this.autocompleteRes = r;
          },
          (e) => {
            this.autocompleteRes = [];
          }
        );
    } else {
      this.autocompleteRes = [];
    }
  }

  // handle selection changes to the model
  onSelect(value) {
    if (this.multiselect) {
      this.value = this.innerValue.map((v) => v.id);
    } else {
      // internal autocomplete control is always set to multiselect
      // so the resolved value is always an array
      this.value = this.innerValue[0].id;
    }
    this.propagate();
  }

  // handle selection changes to the model
  onUnselect(value) {
    this.innerValue = this.innerValue.filter((v) => v.id !== value.id);
    let _value = this.innerValue.map((v) => v.id);
    this.value = this.multiselect ? _value : null;
    if (!this.multiselect) {
      this.clearInnerInput();
    }
    this.propagate();
  }

  onAutoCompleteBlur() {
    this.clearInnerInput();
  }

  private clearInnerInput() {
    if (this.autoCompleteInput.multiInputEL) {
      this.autoCompleteInput.multiInputEL.nativeElement.value = '';
    }
  }

  ngOnInit(): void {
    this.queryJson = {
      fields: [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, SecondaryObjectTypeField.TITLE, SecondaryObjectTypeField.DESCRIPTION],
      types: this.allowedTargetTypes,
      size: this.maxSuggestions
    };
  }
}
