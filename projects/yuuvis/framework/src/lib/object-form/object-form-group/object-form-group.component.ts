import { Component, Input, ViewEncapsulation } from '@angular/core';
import { ObjectFormControlWrapper, YuvFormGroup, YuvFormGroupWrapper } from '../object-form.interface';
import { ObjectFormGroup } from '../object-form.model';

@Component({
  selector: 'yuv-object-form-group',
  templateUrl: './object-form-group.component.html',
  styleUrls: ['./object-form-group.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class ObjectFormGroupComponent {
  private types = {
    STACK: 'stack',
    GROUP: 'group',
    FIELDSET: 'fieldset'
  };

  group: ObjectFormGroup;
  groupType: string;
  isCore: boolean;
  isData: boolean;

  // form situation, if not set default will be 'EDIT'
  @Input() situation = 'EDIT';

  @Input('group')
  set groupd(g: ObjectFormGroup) {
    if (g) {
      this.group = g;
      this.isCore = this.group._eoFormGroup && this.group._eoFormGroup.label === 'core';
      this.isData = this.group._eoFormGroup && this.group._eoFormGroup.label === 'data';
      this.groupType = this.getGroupType();
    } else {
      this.group = null;
    }
  }

  @Input() noGroupLabels: boolean;

  getObjectFormGroup(control): YuvFormGroup {
    return (control as ObjectFormGroup)._eoFormGroup;
  }

  getObjectFormControlWrapper(control): YuvFormGroupWrapper {
    return (control as ObjectFormControlWrapper)._eoFormControlWrapper;
  }

  private getGroupType() {
    // may as well be an ObjectFormControlWrapper so check first
    // if we got a real group
    if (this.group._eoFormGroup) {
      if (this.group._eoFormGroup.type === 'o2mGroupStack') {
        // for data section only render as stack (tabs) if we have more than one child
        if (this.isData && Object.keys(this.group.controls).length === 1) {
          return this.types.GROUP;
        }
        return this.types.STACK;
      }
      if (this.group._eoFormGroup.type === 'o2mGroup') {
        return this.group._eoFormGroup.label && !(this.isCore || this.isData) && !this.noGroupLabels && !this.parentIsStack(this.group)
          ? this.types.FIELDSET
          : this.types.GROUP;
      }
      return this.types.GROUP;
    }
  }

  private parentIsStack(group: ObjectFormGroup): boolean {
    let parentFormElement = group.parent['_eoFormGroup'];
    return parentFormElement && parentFormElement.type === 'o2mGroupStack';
  }
}
