import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AggregateResult,
  BaseObjectTypeField,
  ContentStreamField,
  ObjectTypeField,
  RetentionField,
  ScreenService,
  SearchQuery,
  SearchService,
  SystemService,
  SystemType,
  TranslateService,
  Utils
} from '@yuuvis/core';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs/operators';
import { ObjectFormControlWrapper } from '../../object-form';
import { ObjectFormControl } from '../../object-form/object-form.model';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { SVGIcons } from '../../svg.generated';
import { ObjectType } from './../../../../../core/src/lib/model/object-type.model';
import { ValuePickerItem } from './value-picker/value-picker.component';

@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { class: 'yuv-quick-search' }
})
export class QuickSearchComponent implements OnInit {
  @ViewChild('termEl', { static: false }) termInput: ElementRef;
  @ViewChild('typeSelectTrigger', { static: false }) typeSelectTrigger: ElementRef;
  @ViewChild('fieldSelectTrigger', { static: false }) fieldSelectTrigger: ElementRef;
  @ViewChild('extrasForm', { static: false }) extrasForm: ElementRef;
  @ViewChild('tplValuePicker', { static: false }) tplValuePicker: TemplateRef<any>;
  // @ViewChild('fieldSelector', { static: false }) fieldSelector: MultiSelect;
  // @ViewChild('typeSelector', { static: false }) typeSelector: MultiSelect;

  icClear = SVGIcons.clear;
  searchForm: FormGroup;
  searchFieldsForm: FormGroup;
  invalidTerm: boolean;
  operator = 'AND';
  resultCount: number = null;
  aggTypes: ObjectTypeAggregation[] = [];
  searchHasResults: boolean = true;
  searchQuery: SearchQuery;

  objectTypeSelectLabel: string;
  // objectTypeSelect: { label: string; value: string }[];
  // objectTypeFields: ObjectTypeField[] = [];
  // objectTypeFieldSelect: { label: string; value: ObjectTypeField }[];

  availableObjectTypes: { id: string; label: string; value: string }[];
  availableObjectTypeFields: { id: string; label: string; value: ObjectTypeField }[];

  selectedObjectTypes: string[];

  // list of form element IDs
  formFields: string[] = [];

  // object types that one should not search for
  private skipTypes = [SystemType.DOCUMENT, SystemType.FOLDER];
  // fields that should not be searchable
  private skipFields = [
    ...Object.keys(RetentionField).map(k => RetentionField[k]),
    BaseObjectTypeField.OBJECT_ID,
    BaseObjectTypeField.OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_ID,
    BaseObjectTypeField.PARENT_OBJECT_TYPE_ID,
    BaseObjectTypeField.PARENT_VERSION_NUMBER,
    BaseObjectTypeField.TENANT,
    BaseObjectTypeField.TRACE_ID,
    BaseObjectTypeField.SECONDARY_OBJECT_TYPE_IDS,
    BaseObjectTypeField.BASE_TYPE_ID,
    ContentStreamField.ID,
    ContentStreamField.RANGE,
    ContentStreamField.REPOSITORY_ID,
    ContentStreamField.DIGEST,
    ContentStreamField.ARCHIVE_PATH
  ];

  // emits the query that should be executed
  @Output() query = new EventEmitter<SearchQuery>();

  @HostListener('keydown.alt.+', ['$event']) onAddField(event) {
    if (this.availableObjectTypeFields.length) {
      this.showObjectTypeFieldPicker();
    }
  }

  @HostListener('keydown.alt.-', ['$event']) onAddType(event) {
    if (this.availableObjectTypes.length) {
      this.showObjectTypePicker();
    }
  }

  constructor(
    private fb: FormBuilder,
    private popoverService: PopoverService,
    private translate: TranslateService,
    private screenService: ScreenService,
    private systemService: SystemService,
    private searchService: SearchService,
    private elRef: ElementRef
  ) {
    this.searchQuery = new SearchQuery();
    this.searchForm = this.fb.group({
      term: [''],
      objectTypes: [[]],
      objectTypeFieldSelect: [[]]
    });
    this.searchFieldsForm = this.fb.group({});

    this.searchForm.valueChanges
      .pipe(
        distinctUntilChanged(),
        tap(v => {
          this.searchQuery.term = v.term;
          if (this.formFields.length && v.objectTypes.length !== 1) {
            this.formFields = [];
          }
          this.resultCount = null;
        }),
        debounceTime(500),
        filter(v => v.objectTypes.length || v.term.length)
        // switchMap(_ => this.searchService.aggregate(this.searchQuery))
      )
      .subscribe((res: AggregateResult) => {
        this.processAggregateResult(res);
      });

    this.systemService.system$.subscribe(_ => {
      const types = this.systemService
        .getObjectTypes()
        .filter(t => !this.skipTypes.includes(t.id))
        .map(ot => ({
          id: ot.id,
          label: this.systemService.getLocalizedResource(`${ot.id}_label`),
          value: ot.id
        }))
        .sort(Utils.sortValues('label'));
      this.availableObjectTypes = types;
      this.onObjectTypesSelected([]);
    });
  }

  showObjectTypePicker() {
    this.showValuePicker(this.tplValuePicker, this.typeSelectTrigger.nativeElement, this.availableObjectTypes, 'type');
  }

  showObjectTypeFieldPicker() {
    this.showValuePicker(this.tplValuePicker, this.fieldSelectTrigger.nativeElement, this.availableObjectTypeFields, 'field');
  }

  private showValuePicker(template: TemplateRef<any>, target: HTMLElement, items: ValuePickerItem[], type: 'type' | 'field'): void {
    this.popoverService.open(template, target, {
      data: {
        type: type,
        items: items,
        selected: type === 'type' ? this.selectedObjectTypes : null,
        multiselect: type === 'type'
      }
    });
  }

  onValuePickerResult(type: 'type' | 'field', res: any, popoverRef: PopoverRef) {
    switch (type) {
      case 'field': {
        this.onObjectTypeFieldSelected(res);
        break;
      }
      case 'type': {
        this.onObjectTypesSelected(res);
        break;
      }
    }
    popoverRef.close();
  }

  private onObjectTypeFieldSelected(field: ObjectTypeField) {
    this.addFieldEntry(field);
  }

  private onObjectTypesSelected(types: string[]) {
    // if (this.selectedObjectTypes && this.selectedObjectTypes.length > 0) {
    this.reset();
    // }
    this.selectedObjectTypes = types;
    this.setAvailableObjectTypesFields();

    if (this.selectedObjectTypes.length === 1) {
      this.objectTypeSelectLabel = this.systemService.getLocalizedResource(`${this.selectedObjectTypes[0]}_label`);
    } else if (this.selectedObjectTypes.length === this.availableObjectTypes.length || this.selectedObjectTypes.length === 0) {
      this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.all');
    } else {
      this.objectTypeSelectLabel = this.translate.instant('yuv.framework.quick-search.type.multiple', { size: this.selectedObjectTypes.length });
    }
  }

  private setAvailableObjectTypesFields() {
    this.availableObjectTypeFields = [];

    let sharedFields;

    const selectedObjectTypes: ObjectType[] = this.selectedObjectTypes.length
      ? this.systemService.getObjectTypes().filter(t => this.selectedObjectTypes.includes(t.id))
      : this.systemService.getObjectTypes();

    selectedObjectTypes.forEach(t => {
      if (!sharedFields) {
        sharedFields = t.fields;
      } else {
        // check for fields that are not part of the shared fields
        const fieldIDs = t.fields.map(f => f.id);
        sharedFields = sharedFields.filter(f => fieldIDs.includes(f.id));
      }
    });

    this.availableObjectTypeFields = sharedFields
      .filter(f => !this.skipFields.includes(f.id))
      .map(f => ({
        id: f.id,
        label: this.systemService.getLocalizedResource(`${f.id}_label`),
        value: f
      }))
      .sort(Utils.sortValues('label'));
  }

  executeSearch() {
    this.query.emit(this.searchQuery);
  }

  objectTypeSelectClosed() {
    this.termInput.nativeElement.focus();
  }

  private processAggregateResult(res: AggregateResult) {
    this.resultCount = res.totalNumItems;

    if (res.aggregations && res.aggregations.length) {
      this.searchHasResults = true;

      // res.aggregations.forEach(item => {
      //   this.resultCount += item.count;
      //   this.aggTypes.push({
      //     objectTypeId: item.key,
      //     label: this.systemService.getLocalizedResource(`${item.key}_label`) || item.key,
      //     count: item.count
      //   });
      // });
      // this.aggTypes.sort(Utils.sortValues('label'));
    } else {
      this.searchHasResults = false;
    }
  }

  /**
   * Adds a new form field to the query
   * @param field The object type field to be added
   */
  addFieldEntry(field: ObjectTypeField) {
    // create form element from object type field to be served
    // to an ObjectFormElementComponent
    const ctrl = new ObjectFormControlWrapper({});
    ctrl._eoFormControlWrapper = {
      controlName: field.id,
      situation: 'SEARCH'
    };

    let formControl = new ObjectFormControl({
      value: null,
      disabled: false
    });

    const formElement = {
      label: this.systemService.getLocalizedResource(`${field.id}_label`),
      name: field.id,
      type: field.propertyType
    };

    formControl._eoFormElement = formElement;
    ctrl.addControl(field.id, formControl);
    this.searchFieldsForm.addControl(`fc_${field.id}`, ctrl);
    this.formFields.push(`fc_${field.id}`);
  }

  /**
   * Remove a form element from the query form
   * @param formElement The form element to be removed
   */
  // removeFieldEntry(formElement: ObjectFormControlWrapper) {
  //   this.formFields = this.formFields.filter(f => f._eoFormControlWrapper.controlName !== formElement._eoFormControlWrapper.controlName);
  // }
  removeFieldEntry(formControlName: string) {
    this.formFields = this.formFields.filter(f => f !== formControlName);
    this.searchFieldsForm.removeControl(formControlName);
  }

  reset() {
    this.searchQuery = new SearchQuery();
    this.formFields = [];
    this.searchForm.patchValue({
      term: ''
    });
    this.searchFieldsForm = this.fb.group({});
  }

  toggleOperator() {
    this.operator === 'AND' ? 'OR' : 'AND';
  }

  ngOnInit() {}
}

interface ObjectTypeAggregation {
  objectTypeId: string;
  label: string;
  count: number;
}
