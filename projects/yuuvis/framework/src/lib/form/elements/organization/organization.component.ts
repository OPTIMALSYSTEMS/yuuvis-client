import { Component, forwardRef, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator } from '@angular/forms';
import { SystemService } from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { forkJoin, of } from 'rxjs';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { organization } from '../../../svg.generated';

@Component({
  selector: 'yuv-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrganizationComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => OrganizationComponent),
      multi: true
    }
  ]
})
export class OrganizationComponent implements ControlValueAccessor, Validator {
  @ViewChild('autocomplete') autoCompleteInput: AutoComplete;

  minLength = 2;

  value;
  innerValue: any[] = [];
  autocompleteRes: any[] = [];

  @Input() situation: string;
  @Input() multiselect: boolean;
  @Input() classification: string;
  @Input() readonly: boolean;
  @Input() placeholder: string;

  private dummyData = [
    { title: 'Bartonitz, Martin', id: '1' },
    { title: 'Ansorg, Manuel', id: '2' },
    { title: 'Mustermann, Max', id: '3' }
  ];

  constructor(private iconRegistry: IconRegistryService, private systemService: SystemService) {
    this.iconRegistry.registerIcons([organization]);
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
    this.propagateChange(this.value);
  }

  validate() {
    // null means valid
    return null;
  }

  resolveFn(value: any) {
    let map = (value instanceof Array ? value : [value]).map((v) => {
      let match = this.innerValue.find((iv) => iv.name === v);
      return match ? of(match) : this.systemService.getOrganizationObjectById(v);
    });
    return forkJoin(map).subscribe((data) => {
      this.innerValue = data;
      // this.onValueResolved.emit(this.innerValue);
    });
  }

  autocompleteFn(evt) {
    if (evt.query.length >= this.minLength) {
      this.autocompleteRes = this.dummyData.filter((e) => e.title.includes(evt.query));
      // if (this.multiselect || (!this.multiselect && this.innerValue.length === 0)) {
      //   // this.backend.getJson(this.buildAutocompleteUri(evt.query))
      //   //   .subscribe((res) => {
      //   //     // autocomplete values should be unique and not part of the exceptions
      //   //     this.autocompleteRes = res.filter(v => (!this.value || this.value.indexOf(v.name) === -1) && this.exceptions.indexOf(v.name) === -1)
      //   //       .sort(Utils.sortValues('title'));
      //   //   }, Utils.throw(null,
      //   //     this.translate.instant('eo.form.property.organization.request.error.title'),
      //   //     this.translate.instant('eo.form.property.organization.request.error.msg')
      //   //   ));
      // } else {
      //   this.autocompleteRes = [];
      // }
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
}
