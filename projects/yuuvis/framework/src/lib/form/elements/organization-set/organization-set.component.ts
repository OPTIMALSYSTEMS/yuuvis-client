import { AfterViewInit, Component, forwardRef, HostBinding, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, UntypedFormControl, Validator } from '@angular/forms';
import { Classification, IdmService, OrganizationSetEntry, SystemService } from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { IconRegistryService } from '../../../common';
import { organization, organizationMulti } from '../../../svg.generated';

@Component({
  selector: 'yuv-organization-set',
  templateUrl: './organization-set.component.html',
  styleUrls: ['./organization-set.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrganizationSetComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => OrganizationSetComponent),
      multi: true
    }
  ]
})
export class OrganizationSetComponent implements ControlValueAccessor, Validator, AfterViewInit {
  @ViewChild('autocomplete') autoCompleteInput: AutoComplete;

  value: OrganizationSetEntry[] = [];
  private _isValidInput = true;
  private _targetTypes: string[] = [];
  autocompleteRes;

  @Input() situation: string;
  @Input() autocompleteMinLength: number = 2;
  @Input() readonly: boolean;
  @Input() autofocus: boolean;
  @Input() multiselect: boolean = false;

  private _classifications: string[];
  @Input() set classifications(c: string[]) {
    this._classifications = c;
    if (c?.length) {
      const classifications = this.system.getClassifications(c);
      this._targetTypes = classifications.has(Classification.STRING_ORGANIZATION_SET)
        ? classifications.get(Classification.STRING_ORGANIZATION_SET).options
        : [];
    }
  }
  get classifications() {
    return this._classifications;
  }
  @HostBinding('class.inputDisabled') get _inputDisabled() {
    return !this.multiselect && this.value?.length === 1;
  }
  @HostBinding('class.inputDirty') get _inputDirty() {
    return this.autoCompleteInput?.multiInputEL?.nativeElement?.value;
  }

  constructor(private iconRegistry: IconRegistryService, private idmService: IdmService, private system: SystemService) {
    this.iconRegistry.registerIcons([organization, organizationMulti]);
  }

  propagateChange = (_: any) => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  private _propagate() {
    this.propagateChange(this.value);
  }

  private _propagateValidity(valid = true) {
    if (this._isValidInput !== valid) {
      this._isValidInput = valid;
      this._propagate();
    }
  }

  validate(c: UntypedFormControl) {
    return this._isValidInput ? null : { empty: { valid: false } };
  }

  autocompleteFn(evt) {
    if (evt.query.length >= this.autocompleteMinLength) {
      this.idmService.queryOrganizationEntity(evt.query, this._targetTypes).subscribe({
        next: (entries: OrganizationSetEntry[]) => {
          this.autocompleteRes = entries.filter((e) => !this.value?.some((value) => value.id === e.id));
          this._propagateValidity(this.autocompleteRes.length > 0);
        },
        error: (e) => {
          this.autocompleteRes = [];
          this._propagateValidity(this.autocompleteRes.length > 0);
        }
      });
    } else {
      this.autocompleteRes = [];
    }
  }

  onSelect(value) {
    if (!this.multiselect) {
      this.value = this.value.slice(-1);
    }
    this._propagate();
  }

  onUnselect(value) {
    if (!this.multiselect) {
      this._clearInnerInput();
    }
    this._propagate();
  }

  onAutoCompleteBlur() {
    this._clearInnerInput();
  }

  private _clearInnerInput() {
    if (this.autoCompleteInput.multiInputEL) {
      this.autoCompleteInput.multiInputEL.nativeElement.value = '';
      this._propagateValidity(true);
    }
  }

  ngAfterViewInit() {
    if (this.autofocus) {
      setTimeout(() => this.autoCompleteInput.multiInputEL?.nativeElement.focus());
    }
  }
}
