import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AggregateResult, ObjectType, ObjectTypeField, ScreenService, SearchQuery, SearchService, SystemService, TranslateService, Utils } from '@yuuvis/core';
import { MultiSelect } from 'primeng/multiselect';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { ObjectFormControlWrapper } from '../../object-form';
import { ObjectFormControl } from '../../object-form/object-form.model';
import { SVGIcons } from '../../svg.generated';

@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { class: 'yuv-quick-search' }
})
export class QuickSearchComponent implements OnInit {
  @ViewChild('termEl', { static: false }) termInput: ElementRef;
  @ViewChild('extrasForm', { static: false }) extrasForm: ElementRef;
  @ViewChild('fieldSelector', { static: false }) fieldSelector: MultiSelect;
  @ViewChild('typeSelector', { static: false }) typeSelector: MultiSelect;

  icClear = SVGIcons.clear;
  searchForm: FormGroup;
  searchFieldsForm: FormGroup;
  invalidTerm: boolean;
  operator = 'AND';
  resultCount: number = null;
  aggTypes: ObjectTypeAggregation[] = [];
  searchHasResults: boolean = true;
  searchQuery: SearchQuery;

  objectTypeSelect: { label: string; value: string }[];
  // objectTypeFields: ObjectTypeField[] = [];
  objectTypeFieldSelect: { label: string; value: ObjectTypeField }[];

  // list of form element IDs
  formFields: string[] = [];

  // emits the query that should be executed
  @Output() query = new EventEmitter<SearchQuery>();

  @HostListener('keydown.alt.+', ['$event']) onAddField(event) {
    if (this.searchQuery.types.length === 1) {
      // this.overlayPanel.toggle(event, this.termInput.nativeElement);
      this.fieldSelector.show();
    }
  }

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private screenService: ScreenService,
    private systemService: SystemService,
    private searchService: SearchService
  ) {
    this.searchForm = this.fb.group({
      term: [''],
      objectTypes: [[]],
      objectTypeFieldSelect: [[]]
    });
    this.searchFieldsForm = this.fb.group({});

    this.searchForm.get('objectTypeFieldSelect').valueChanges.subscribe(v => {
      if (v.length) {
        this.addFieldEntry(v[0]);
        this.searchForm.patchValue(
          {
            objectTypeFieldSelect: []
          },
          { emitEvent: false }
        );
      }
      setTimeout(() => {
        if (this.fieldSelector) {
          this.fieldSelector.hide();
        }

        const inputs = this.extrasForm.nativeElement.querySelectorAll('input:not([readonly])');
        console.log(inputs);
        if (inputs.length) {
          inputs[inputs.length - 1].focus();
        }
      }, 300);
    });

    this.searchForm.valueChanges // .get('searchInput')
      .pipe(
        distinctUntilChanged(),
        tap(v => {
          this.searchQuery.term = v.term;
          if (this.formFields.length && v.objectTypes.length !== 1) {
            this.formFields = [];
          }
          this.searchQuery.types = v.objectTypes;
          this.objectTypeFieldSelect = [];
          if (v.objectTypes.length === 1 && v.objectTypes[0] !== 'all') {
            const type: ObjectType = this.systemService.getObjectType(this.searchQuery.types[0]);
            this.objectTypeFieldSelect = type.fields.map(f => ({
              label: this.systemService.getLocalizedResource(`${f.id}_label`),
              value: f
            }));
          }
          this.resultCount = null;
        }),
        debounceTime(500),
        filter(v => v.objectTypes.length || v.term.length),
        switchMap(_ => this.searchService.aggregate(this.searchQuery))
      )
      .subscribe((res: AggregateResult) => {
        this.processAggregateResult(res);
      });

    this.systemService.system$.subscribe(_ => {
      this.objectTypeSelect = [
        ...[
          {
            label: this.translate.instant('yuv.framework.quick-search.type.all'),
            value: 'all'
          }
        ],
        ...this.systemService
          .getObjectTypes()
          .map(ot => ({
            label: this.systemService.getLocalizedResource(`${ot.id}_label`),
            value: ot.id
          }))
          .sort(Utils.sortValues('label'))
      ];
    });
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
      term: '',
      objectTypes: [],
      objectTypeFieldSelect: []
    });
  }

  toggleOperator() {
    this.operator === 'AND' ? 'OR' : 'AND';
  }

  ngOnInit() {
    this.searchQuery = new SearchQuery();
  }
}

interface ObjectTypeAggregation {
  objectTypeId: string;
  label: string;
  count: number;
}
