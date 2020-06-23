import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ObjectTypeField, RangeValue, SearchFilter, SearchQuery, SystemService } from '@yuuvis/core';
import { Subscription } from 'rxjs';
import { takeUntilDestroy } from 'take-until-destroy';
import { Selectable } from '../../../grouped-select';
import { ObjectFormControl } from '../../../object-form/object-form.model';
import { Situation } from '../../../object-form/object-form.situation';
import { ObjectFormUtils } from '../../../object-form/object-form.utils';
import { ObjectFormControlWrapper } from './../../../object-form/object-form.interface';

@Component({
  selector: 'yuv-search-filter-form',
  templateUrl: './search-filter-form.component.html',
  styleUrls: ['./search-filter-form.component.scss']
})
export class SearchFilterFormComponent implements OnInit, OnDestroy {
  @ViewChild('storedFilterInput') storedFilterInput: ElementRef;
  @ViewChild('extrasForm') extrasForm: ElementRef;

  searchFieldsForm: FormGroup;
  formFields = [];
  formSubscription: Subscription;
  filter: Selectable = { id: '', label: '' };

  private filterQuery: SearchQuery;
  private availableObjectTypeFields: Selectable[];

  @Input() disabled = false;

  @Input() set options(opts: { filter: Selectable; activeFilters: SearchFilter[]; availableObjectTypeFields: Selectable[] }) {
    if (opts) {
      const { filter, activeFilters, availableObjectTypeFields } = opts;
      this.filterQuery = new SearchQuery();
      this.filter = { ...filter };
      this.availableObjectTypeFields = availableObjectTypeFields;
      const sf: SearchFilter[] = filter ? filter.value : [];
      this.updateSearchFields((activeFilters || []).map((f) => sf.find((s) => s.property === f.property) || f));
    }
  }

  @Output() filterChanged = new EventEmitter<Selectable>();
  @Output() controlRemoved = new EventEmitter<string>();

  constructor(private systemService: SystemService, private fb: FormBuilder) {}

  private initSearchFieldsForm() {
    // object type field form (form holding the query fields)
    this.searchFieldsForm = this.fb.group({});
    this.formSubscription = this.searchFieldsForm.valueChanges.pipe(takeUntilDestroy(this)).subscribe((formValue) => {
      this.onSearchFieldFormChange();
    });
  }

  private onSearchFieldFormChange() {
    // generate search query filter section from form fields

    // extract form controls
    const formControls: ObjectFormControl[] = [];
    Object.keys(this.searchFieldsForm.controls).forEach((k) => {
      const wrapper: ObjectFormControlWrapper = this.searchFieldsForm.controls[k] as ObjectFormControlWrapper;
      formControls.push(wrapper.controls[wrapper._eoFormControlWrapper.controlName] as ObjectFormControl);
    });

    // get comparator for current filter settings (avoiding unnecessary aggregate calls)
    const filterCompareCurrent = this.getFilterComparator(this.filterQuery.filters);

    // setup filters from form controls
    this.filterQuery.clearFilters();
    formControls.forEach((fc) => {
      const filter = new SearchFilter(fc._eoFormElement.name, SearchFilter.OPERATOR.EQUAL, fc.value);
      if (!filter.isEmpty() || fc._eoFormElement.isNotSetValue) {
        this.filterQuery.addFilter(filter);
      }
    });
    const filterCompareNew = this.getFilterComparator(this.filterQuery.filters);
    // only execute aggregate call if filter settings have actually been changed
    if (filterCompareCurrent !== filterCompareNew) {
      this.filter.value = this.filterQuery.filters;
      this.filterChanged.emit(this.filter);
    }
  }

  /**
   * Generates an object from a filters array and returns its JSON string (stringified).
   * Used for checking equality of filter arrays.
   * @param filters
   */
  private getFilterComparator(filters: SearchFilter[]): string {
    return filters
      .map((f) => f.toString())
      .sort()
      .join();
  }

  updateSearchFields(filters: SearchFilter[]) {
    this.formFields.forEach((ff) => !(filters || []).find((f) => ff === `fc_${f.property}`) && this.removeFieldEntry(ff, false));

    const formPatch = {};
    (filters || []).forEach((filter) => {
      const otf = this.availableObjectTypeFields.find((o) => o.id === filter.property);
      if (otf) {
        const field = otf.value as ObjectTypeField;
        this.addFieldEntry(field, filter.operator && filter.isEmpty());
        if (filter.operator) {
          // setup values based on whether or not the type supports ranges
          const isRange = ['datetime', 'integer', 'decimal'].includes(field.propertyType);
          formPatch[`fc_${otf.id}`] = { [otf.id]: !isRange ? filter.firstValue : new RangeValue(filter.operator, filter.firstValue, filter.secondValue) };
        }
      }
    });

    if (this.searchFieldsForm && Object.keys(formPatch).length) {
      this.searchFieldsForm.patchValue(formPatch);
    }
  }

  /**
   * Adds a new form field to the query
   * @param field The object type field to be added
   */
  addFieldEntry(field: ObjectTypeField, isEmpty = false) {
    if (!this.searchFieldsForm) {
      this.initSearchFieldsForm();
    }
    const formElement = this.systemService.toFormElement(field);
    // required fields make no sense for search
    formElement.required = false;
    // disable descriptions as well in order to keep the UI clean
    formElement.description = null;
    formElement.isNotSetValue = isEmpty;
    formElement.readonly = this.disabled;

    const formControl = ObjectFormUtils.elementToFormControl(formElement, Situation.SEARCH);

    if (this.formFields.includes(`fc_${field.id}`)) {
      // todo: refactor this discusting code && isNotSetValue check
      const control = this.searchFieldsForm.get(`fc_${field.id}`) as ObjectFormControlWrapper;
      const name = control._eoFormControlWrapper.controlName;
      control.controls[name]['__eoFormElement'] = formControl.controls[name]['__eoFormElement'];
      // control.updateValueAndValidity();
    } else {
      this.searchFieldsForm.addControl(`fc_${field.id}`, formControl);
      this.formFields.push(`fc_${field.id}`);
    }

    // focus the generated field
    setTimeout(() => this.focusLastExtrasField(), 500);
  }

  private focusLastExtrasField() {
    const focusables = this.extrasForm.nativeElement.querySelectorAll('input, textarea');
    if (focusables.length) {
      focusables[focusables.length - 1].focus();
    }
  }

  /**
   * Remove a form element from the query form
   * @param formElement The form element to be removed
   */
  removeFieldEntry(formControlName: string, emit = true) {
    this.formFields = this.formFields.filter((f) => f !== formControlName);
    this.searchFieldsForm.removeControl(formControlName);
    if (emit) {
      this.controlRemoved.emit(formControlName.replace('fc_', ''));
      this.onSearchFieldFormChange();
    }
  }

  nameChanged(name: string) {
    this.filterChanged.emit(this.filter);
  }

  ngOnInit() {}

  ngOnDestroy() {}
}
