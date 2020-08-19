import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ObjectTypeField, RangeValue, SearchFilter, SearchFilterGroup, SearchQuery, SystemService } from '@yuuvis/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroy } from 'take-until-destroy';
import { Selectable } from '../../../grouped-select';
import { ObjectFormControl } from '../../../object-form/object-form.model';
import { Situation } from '../../../object-form/object-form.situation';
import { ObjectFormUtils } from '../../../object-form/object-form.utils';
import { IconRegistryService } from './../../../common/components/icon/service/iconRegistry.service';
import { ObjectFormControlWrapper } from './../../../object-form/object-form.interface';
import { clear, dragHandle } from './../../../svg.generated';

@Component({
  selector: 'yuv-search-filter-form',
  templateUrl: './search-filter-form.component.html',
  styleUrls: ['./search-filter-form.component.scss']
})
export class SearchFilterFormComponent implements OnInit, OnDestroy {
  @ViewChild('extrasForm') extrasForm: ElementRef;

  get filterGroup(): SearchFilterGroup {
    return this.filterQuery.filterGroup;
  }
  dropTargetIds: string[];
  dropActionTodo: {
    targetId: string;
    action?: string;
  } = null;
  dragMovedSubject = new Subject();

  searchFieldsForm: FormGroup;
  formFields = [];
  formSubscription: Subscription;
  filter: Selectable = { id: '', label: '' };

  private filterQuery: SearchQuery;
  private availableObjectTypeFields: Selectable[];

  @Input() disabled = false;

  @Input() set options(opts: { filter: Selectable; availableObjectTypeFields: Selectable[] }) {
    if (opts) {
      const { filter, availableObjectTypeFields } = opts;
      this.filterQuery = new SearchQuery();
      this.filterQuery.filterGroup = SearchFilterGroup.fromArray(filter.value).clone();
      this.filter = { ...filter };
      this.availableObjectTypeFields = availableObjectTypeFields;
      this.updateSearchFields(this.filterGroup.filters);
      this.onFilterChanged(false);
    }
  }

  @Input() set newFilters(filters: any[]) {
    if (filters) {
      this.filterGroup.group.push(
        ...filters.map((f: any) =>
          f instanceof SearchFilterGroup ? (f.filters.length === 1 ? f.filters[0] : f).clone() : Object.assign(f.clone(), { excludeFromQuery: f.isEmpty() })
        )
      );
      this.updateSearchFields(this.filterGroup.filters);
      this.onFilterChanged();
    }
  }

  @Output() filterChanged = new EventEmitter<Selectable>();
  @Output() controlRemoved = new EventEmitter<string>();
  @Output() valid = new EventEmitter<boolean>();

  constructor(private systemService: SystemService, private fb: FormBuilder, private iconRegistry: IconRegistryService) {
    this.dragMovedSubject.pipe(debounceTime(50)).subscribe((event) => this.dragMoved(event));
    this.iconRegistry.registerIcons([dragHandle, clear]);
  }

  private initSearchFieldsForm() {
    // object type field form (form holding the query fields)
    this.searchFieldsForm = this.fb.group({});
    this.formSubscription = this.searchFieldsForm.valueChanges.pipe(takeUntilDestroy(this)).subscribe((formValue) => {
      this.onSearchFieldFormChange();
    });
  }

  private onFilterChanged(emit = true) {
    this.filter.value = [(this.filterQuery.filterGroup = this.filterGroup)];
    this.dropTargetIds = [this.filterGroup.id, ...this.filterGroup.groups.map((g) => g.id), ...this.filterGroup.filters.map((f) => f.id)];
    return emit && this.filterChanged.emit(this.filter);
  }

  private onSearchFieldFormChange() {
    this.valid.emit(this.searchFieldsForm.valid);

    // get comparator for current filter settings (avoiding unnecessary aggregate calls)
    const filterCompareCurrent = this.filterGroup.toShortString();

    // setup filters from form controls
    Object.keys(this.searchFieldsForm.controls).forEach((id) => {
      const wrapper = this.searchFieldsForm.controls[id] as ObjectFormControlWrapper;
      const fc = wrapper.controls[wrapper._eoFormControlWrapper.controlName] as ObjectFormControl;
      const original = this.filterGroup.find(id);
      if (original) {
        const filter = new SearchFilter(fc._eoFormElement.name, Array.isArray(fc.value) ? SearchFilter.OPERATOR.IN : SearchFilter.OPERATOR.EQUAL, fc.value);
        if (!filter.isEmpty() || fc._eoFormElement.isNotSetValue) {
          Object.assign(original, filter, { id: original.id, excludeFromQuery: false });
        } else {
          Object.assign(original, { excludeFromQuery: true });
        }
      }
    });
    // only execute aggregate call if filter settings have actually been changed
    if (filterCompareCurrent !== this.filterGroup.toShortString()) {
      this.onFilterChanged();
    }
  }

  updateSearchFields(filters: SearchFilter[]) {
    this.formFields.forEach((ff) => !(filters || []).find((f) => ff === f.id) && this.removeFieldEntry(ff, false));

    const formPatch = {};
    (filters || []).forEach((filter) => {
      const otf = this.availableObjectTypeFields.find((o) => o.id === filter.property);
      if (otf) {
        const field = otf.value as ObjectTypeField;
        this.addFieldEntry(field, filter.operator && filter.isEmpty(), filter.id);
        if (filter.operator) {
          // setup values based on whether or not the type supports ranges
          const isRange = ['datetime', 'integer', 'decimal'].includes(field.propertyType);
          formPatch[filter.id] = { [otf.id]: !isRange ? filter.firstValue : new RangeValue(filter.operator, filter.firstValue, filter.secondValue) };
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
  addFieldEntry(field: ObjectTypeField, isEmpty = false, id?: string, focus = true) {
    const fcID = `${id || field.id}`;
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

    if (this.formFields.includes(fcID)) {
      // todo: refactor this discusting code && isNotSetValue check
      const control = this.searchFieldsForm.get(fcID) as ObjectFormControlWrapper;
      const name = control._eoFormControlWrapper.controlName;
      control.controls[name]['__eoFormElement'] = formControl.controls[name]['__eoFormElement'];
      // control.updateValueAndValidity();
    } else {
      this.searchFieldsForm.addControl(fcID, formControl);
      this.formFields.push(fcID);
    }

    if (focus) {
      // focus the generated field
      setTimeout(() => this.focusLastExtrasField(), 500);
    }
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
    this.filterGroup.remove(formControlName);
    if (emit) {
      this.controlRemoved.emit(formControlName);
      this.onFilterChanged();
    }
  }

  operatorClick(group: SearchFilter | SearchFilterGroup) {
    if (group instanceof SearchFilterGroup) {
      group.operator = group.operator === SearchFilterGroup.OPERATOR.OR ? SearchFilterGroup.OPERATOR.AND : SearchFilterGroup.OPERATOR.OR;
      this.onFilterChanged();
    }
  }

  ngOnInit() {}

  ngOnDestroy() {}

  dragMoved(event: any) {
    const e = window.document.elementFromPoint(event.pointerPosition.x, event.pointerPosition.y);
    const container = e && (e.classList.contains('node-item') ? e : e.closest('.node-item'));

    if (!e || !container) {
      return this.clearDragInfo();
    }

    this.dropActionTodo = {
      action: 'inside',
      targetId: container.getAttribute('data-id')
    };
    const targetRect = container.getBoundingClientRect();
    const oneThird = targetRect.height / 3;

    if (event.pointerPosition.y - targetRect.top < oneThird) {
      this.dropActionTodo.action = 'before';
    } else if (event.pointerPosition.y - targetRect.top > 2 * oneThird) {
      this.dropActionTodo.action = 'after';
    }
    this.showDragInfo();
  }

  drop(event: any) {
    if (!this.dropActionTodo) {
      return;
    }

    const draggedItemId = event.item.data;
    const parentItem = this.filterGroup.find(event.previousContainer.id);
    const targetList = this.filterGroup.findParent(this.dropActionTodo.targetId) || this.filterGroup;
    const target = this.filterGroup.find(this.dropActionTodo.targetId);
    const draggedItem = this.filterGroup.find(draggedItemId);

    parentItem.group = parentItem.group.filter((c) => c.id !== draggedItemId);
    if (this.dropActionTodo.action.match(/before|after/)) {
      const targetIndex = targetList.group.findIndex((c) => c.id === this.dropActionTodo.targetId);
      targetList.group.splice(targetIndex + (this.dropActionTodo.action === 'before' ? 0 : 1), 0, draggedItem);
    } else {
      if (target.group) {
        target.group.push(draggedItem);
      } else {
        targetList.group = targetList.group.map((g) =>
          g.id === target.id ? new SearchFilterGroup(target.property + '_' + draggedItem.property, 'OR', [target, draggedItem]) : g
        );
      }
    }

    this.clearDragInfo(true);
    this.onFilterChanged();
  }

  showDragInfo() {
    this.clearDragInfo();
    if (this.dropActionTodo) {
      window.document.getElementById('node-' + this.dropActionTodo.targetId).classList.add('drop-' + this.dropActionTodo.action);
    }
  }
  clearDragInfo(dropped = false) {
    if (dropped) {
      this.dropActionTodo = null;
    }
    window.document.querySelectorAll('.drop-before').forEach((element) => element.classList.remove('drop-before'));
    window.document.querySelectorAll('.drop-after').forEach((element) => element.classList.remove('drop-after'));
    window.document.querySelectorAll('.drop-inside').forEach((element) => element.classList.remove('drop-inside'));
  }
}
