import { AfterViewInit, Component, forwardRef, HostBinding, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, UntypedFormControl, Validator } from '@angular/forms';
import { Classification, IdmService, OrganizationSetEntry, SystemService } from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
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

  innerValue: OrganizationSetEntry[] = [];
  value: any;
  private _isValidInput = true;
  private _targetTypes: string[] = [];
  autocompleteRes;

  @Input() situation: string;
  @Input() autocompleteMinLength: number = 2;
  @Input() readonly: boolean;
  @Input() autofocus: boolean;
  @Input() multiselect: boolean = false;
  /**
   * Will attch the overlay to this HTMLelement
   */
  @Input() appendTo = null;

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
    return !this.multiselect && this.innerValue?.length === 1;
  }
  @HostBinding('class.inputDirty') get _inputDirty() {
    return this.autoCompleteInput?.multiInputEl?.nativeElement?.value;
  }

  constructor(private iconRegistry: IconRegistryService, private idmService: IdmService, private system: SystemService) {
    this.iconRegistry.registerIcons([organization, organizationMulti]);
  }

  propagateChange = (_: any) => { };

  writeValue(value: any): void {
    const val = Array.isArray(value) ? value.map((v) => (typeof v === 'string' ? JSON.parse(v) : v)) : value ? [JSON.parse(value)] : [];
    this.innerValue = val;
    this.value = val.map((v) => JSON.stringify(v));
    if (!this.multiselect) {
      this.value = this.value[0] || null;
    }
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void { }

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
          this.autocompleteRes = entries.filter((e) => !this.innerValue?.some((value) => value.id === e.id));
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

  // handle selection changes to the model
  onSelect(value: OrganizationSetEntry) {
    this.writeValue(this.multiselect ? this.innerValue : this.innerValue.slice(-1));
    this._propagate();
  }

  // handle selection changes to the model
  onUnselect(value: OrganizationSetEntry) {
    this.writeValue(this.innerValue.filter((v) => v.id !== value.id));
    if (!this.multiselect) {
      this._clearInnerInput();
    }
    this._propagate();
  }

  onAutoCompleteBlur() {
    this._clearInnerInput();
  }

  private _clearInnerInput() {
    if (this.autoCompleteInput.multiInputEl) {
      this.autoCompleteInput.multiInputEl.nativeElement.value = '';
      this._propagateValidity(true);
    }
  }

  ngAfterViewInit() {
    if (this.autofocus) {
      setTimeout(() => this.autoCompleteInput.multiInputEl?.nativeElement.focus());
    }
  }
}
