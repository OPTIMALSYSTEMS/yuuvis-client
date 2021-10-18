import { AfterViewInit, Component, forwardRef, HostBinding, HostListener, Input, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UserService, YuvUser } from '@yuuvis/core';
import { AutoComplete } from 'primeng/autocomplete';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { organization } from '../../../svg.generated';

/**
 * Creates form input for organisation values.
 * Implements `ControlValueAccessor` so it can be used within Angular forms.
 *
 * [Screenshot](../assets/images/yuv-organization.gif)
 *
 * @example
 * <yuv-organization [multiselect]="true"></yuv-organization>
 *
 *
 */

@Component({
  selector: 'yuv-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OrganizationComponent),
      multi: true
    }
  ]
})
export class OrganizationComponent implements ControlValueAccessor, AfterViewInit {
  @ViewChild('autocomplete') autoCompleteInput: AutoComplete;
  minLength = 2;

  value;
  innerValue: YuvUser[] = [];
  autocompleteRes: YuvUser[] = [];

  // prevent ENTER from being propagated, because the component could be located
  // inside some other component that also relys on ENTER
  @HostListener('keydown.enter', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    event.stopPropagation();
  }

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
   * Additional semantics for the form element.
   */
  @Input() classifications: string[];
  /**
   * Will prevent the input from being changed (default: false)
   */
  @Input() readonly: boolean;
  /**
   * Set this to true and the component will try to gain focus once it has been rendered.
   * Notice that this is not reliable. If there are any other components that are rendered
   * later and also try to be focused, they will 'win', because there can only be one focus.
   */
  @Input() autofocus: boolean;

  /**
   * ID of user to be excluded from the autocomplete result
   */
  @Input() exclude: string;

  constructor(private iconRegistry: IconRegistryService, private userService: UserService) {
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
    this._inputDisabled = !this.multiselect && this.innerValue.length === 1;
    this.propagateChange(this.value);
  }

  resolveFn(value: any) {
    const map = (value instanceof Array ? value : [value]).map((v) => {
      const match = this.innerValue.find((iv) => iv.id === v);
      return match
        ? of(match)
        : this.userService.getUserById(v).pipe(
            catchError((e) =>
              of(
                new YuvUser(
                  {
                    id: v,
                    title: v,
                    image: null
                  },
                  null
                )
              )
            )
          );
    });
    return forkJoin(map).subscribe((data) => {
      this.innerValue = data;
      setTimeout(() => this.autoCompleteInput.cd.markForCheck());
    });
  }

  autocompleteFn(evt) {
    if (evt.query.length >= this.minLength) {
      this.userService.queryUser(evt.query, this.exclude).subscribe((users: YuvUser[]) => {
        this.autocompleteRes = users.filter((user) => !this.innerValue.some((value) => value.id === user.id));
      });
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

  ngAfterViewInit() {
    if (this.autoCompleteInput.multiInputEL && this.autofocus) {
      setTimeout((_) => {
        this.autoCompleteInput.multiInputEL.nativeElement.focus();
      });
    }
  }
}
