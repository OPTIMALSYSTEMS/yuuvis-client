import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AggregateResult, BaseObjectTypeField, ScreenService, SearchQuery, SearchService, SystemService, Utils } from '@yuuvis/core';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { ObjectFormControlWrapper } from '../../object-form';
import { ObjectFormControl } from '../../object-form/object-form.model';
import { SVGIcons } from '../../svg.generated';
import { ObjectType } from './../../../../../core/src/lib/model/object-type.model';
import { ObjectTypeField } from './../../../../../core/src/lib/service/system/system.interface';

@Component({
  selector: 'yuv-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss'],
  host: { class: 'yuv-quick-search' }
})
export class QuickSearchComponent implements OnInit {
  icSearch = SVGIcons.search;
  searchForm: FormGroup;
  invalidTerm: boolean;
  resultCount: number = null;
  aggTypes: ObjectTypeAggregation[] = [];
  searchHasResults: boolean = true;
  private searchQuery: SearchQuery;

  objectTypeSelect: { label: string; value: string }[];
  objectTypeFieldSelect: { label: string; field: ObjectTypeField }[];

  formFields: any[] = [];

  // emits the query that should be executed
  @Output() query = new EventEmitter<SearchQuery>();

  constructor(private fb: FormBuilder, private screenService: ScreenService, private systemService: SystemService, private searchService: SearchService) {
    this.searchForm = this.fb.group({
      term: [''],
      objectTypes: [[]]
    });
    this.searchForm.valueChanges // .get('searchInput')
      .pipe(
        distinctUntilChanged(),
        tap(v => {
          this.searchQuery.term = v.term;
          this.searchQuery.types = v.objectTypes;
          if (v.objectTypes.length === 1) {
            const type: ObjectType = this.systemService.getObjectType(this.searchQuery.types[0]);
            this.objectTypeFieldSelect = type.fields.map(f => ({
              label: this.systemService.getLocalizedResource(`${f.id}_label`),
              field: f
            }));
          }
          this.resultCount = null;
        }),
        debounceTime(500),
        filter(v => v.objectTypes.length || v.term.length),
        switchMap(_ => this.searchService.aggregate(this.searchQuery, BaseObjectTypeField.OBJECT_TYPE_ID))
      )
      .subscribe((res: AggregateResult) => {
        this.processAggregateResult(res);
      });

    this.systemService.system$.subscribe(_ => {
      this.objectTypeSelect = this.systemService.getObjectTypes().map(ot => ({
        label: this.systemService.getLocalizedResource(`${ot.id}_label`),
        value: ot.id
      }));
    });
  }

  executeSearch() {
    if (this.searchQuery.term) {
      this.query.emit(this.searchQuery);
    }
  }

  // onAggObjectTypeClick(agg: ObjectTypeAggregation) {
  //   this.searchQuery.addType(agg.objectTypeId);
  //   this.executeSearch();
  // }

  private processAggregateResult(res: AggregateResult) {
    if (res.aggregations && res.aggregations.length) {
      this.searchHasResults = true;
      this.resultCount = 0;

      res.aggregations.forEach(item => {
        this.resultCount += item.count;
        this.aggTypes.push({
          objectTypeId: item.key,
          label: this.systemService.getLocalizedResource(`${item.key}_label`) || item.key,
          count: item.count
        });
      });
      this.aggTypes.sort(Utils.sortValues('label'));
    } else {
      this.searchHasResults = false;
    }
  }

  addFieldEntry(id: string) {
    const field = this.objectTypeFieldSelect.find(f => f.field.id === id);
    const ctrl = new ObjectFormControlWrapper({});
    ctrl._eoFormControlWrapper = {
      controlName: field.field.id,
      situation: ''
    };

    let formControl = new ObjectFormControl({
      value: null,
      disabled: false
    });

    // formElement.readonly = controlDisabled;
    const formElement = {
      label: field.label,
      name: field.field.id,
      type: field.field.propertyType
    };

    formControl._eoFormElement = formElement;
    ctrl.addControl(field.field.id, formControl);

    this.formFields.push(ctrl);
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
