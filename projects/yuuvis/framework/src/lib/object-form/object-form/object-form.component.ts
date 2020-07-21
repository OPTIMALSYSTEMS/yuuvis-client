import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { Logger, RangeValue, SearchFilter, SearchService, SystemService } from '@yuuvis/core';
import { cloneDeep } from 'lodash-es';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { UnsubscribeOnDestroy } from '../../common/util/unsubscribe.component';
import { ObjectFormScriptService } from '../object-form-script/object-form-script.service';
import { ObjectFormScriptingScope } from '../object-form-script/object-form-scripting-scope';
import { FormStatusChangedEvent, ObjectFormControlWrapper, ObjectFormOptions } from '../object-form.interface';
import { ObjectFormControl, ObjectFormGroup } from '../object-form.model';
import { ObjectFormService } from '../object-form.service';
import { ObjectFormUtils } from '../object-form.utils';
import { FormValidation } from '../object-form.validation';
import { PluginsService } from './../../services/plugins/plugins.service';
import { Situation } from './../object-form.situation';

/**
 * Component rendering a model based form.
 * The yuuvis backend provides form models for different kinds of object
 * types and situations. This component is able to render those models according
 * the their situation. It also has the ability to run form scripts that interact
 * with the form elements based on events triggered when values change.
 *
 *  [Screenshot](../assets/images/yuv-object-form.gif)
 *
 * @example
 * <yuv-object-form [formOptions]="options" (statusChanged)="check($event)"></yuv-object-form>
 */
@Component({
  selector: 'yuv-object-form',
  templateUrl: './object-form.component.html',
  providers: [ObjectFormService, ObjectFormScriptService],
  styleUrls: ['./object-form.component.scss']
})
export class ObjectFormComponent extends UnsubscribeOnDestroy implements OnDestroy, AfterViewInit {
  /**
   * There are special scenarios where forms are within a form themselves.
   * Setting this property to true, will handle the current form in a
   * slightly different way when it comes to form scripting.
   */
  @Input() isInnerTableForm: boolean;

  /**
   * Inputs and settings for the form.
   */
  @Input('formOptions')
  set options(formOptions: ObjectFormOptions) {
    this.defaultFormOptions = formOptions;
    this.formOptions = cloneDeep(formOptions);
    this.init();
  }

  /**
   * triggered when the forms state has been changed
   */
  @Output() statusChanged = new EventEmitter<FormStatusChangedEvent>();

  /**
   * handler to be executed after the form has been set up
   */
  @Output() onFormReady = new EventEmitter();

  // counter for naming the forms groups
  gCount = 0;
  public formOptions: ObjectFormOptions;
  public defaultFormOptions: ObjectFormOptions;
  // the actual form instance
  public form;
  // property for holding the forms data used for comparison when a form-changed-event
  // is fetched to indicate wher or not the indexdata were changed or just the properties
  // of the form elements (eg. form script setting fields to readonly)
  private formData: any;
  private scriptModel = {};
  private scriptingScope: ObjectFormScriptingScope;
  private subscriptions: Subscription[] = [];

  // local store for all the form control references
  private formControls = {};
  private initialValidators = {};

  constructor(
    private logger: Logger,
    private elementRef: ElementRef,
    private systemService: SystemService,
    private formScriptService: ObjectFormScriptService,
    private formHelperService: ObjectFormService,
    private pluginService: PluginsService,
    private cdRef: ChangeDetectorRef
  ) {
    super();
  }

  // initialize the form based on the provided form options
  private init() {
    this.form = null;
    setTimeout(() => {
      this.initialValidators = {};
      this.unsubscribeAll();
      this.buildReactiveForm(this.formOptions || {});
    }, 0);
  }

  private initOptions() {
    this.options = this.defaultFormOptions;
  }

  private initScriptingScope(formOptions, dataFormModel) {
    const { data, actions, objects, context } = (formOptions || {}) as ObjectFormOptions;

    if (this.scriptingScope) {
      this.scriptingScope.setModel(this.scriptModel);
      /** provide access to actions (used inside of BPM-Forms) */
      this.scriptingScope.actions = actions;
      /** provide access to additional objects (used for example in BPM-Start-Forms to
       * add data of DMS-Objects to start the process for)
       */
      this.scriptingScope.objects = objects;
      this.scriptingScope.context = context;
      /** provide readonly access to initial form data (which may also contain values that
       * are not rendered as form elements (invisible values))
       */
      this.scriptingScope.data = data;

      /** by default, scripting scopes are applied to forms. But table elements create their own scope
       * for editing rows. Being one of those inner forms should not run the form script again, but
       * instead just provide the observing abilities of the scripting scope.
       */
      if (!this.isInnerTableForm && dataFormModel) {
        const scriptName = dataFormModel.name + '_' + dataFormModel.situation;

        this.logger.debug('executing form script ' + scriptName);
        this.formScriptService.runFormScript(this.scriptingScope, dataFormModel.script, scriptName);
      }
    }
  }

  public focusForm() {
    this.elementRef.nativeElement.querySelector('input').focus();
  }

  public setFormData(data) {
    this.formOptions.data = data;
    setTimeout(() => this.init(), 0);
  }

  /**
   * Extracts the values from the form model. Each form value is represented by one
   * property on the result object holding the fields value. The keys (properties) are the `name`
   * properties of the form element (in SEARCH situation the `qname` field is used).
   *
   * How values are extracted is influenced by the forms situation.
   *
   * @return object of key value pairs
   */
  public getFormData() {
    return this.formToData();
  }

  public setFormPristine() {
    this.form.markAsPristine();
  }

  // reset the form to its initial state
  public resetForm() {
    this.initOptions();
    this.emitFormChangedEvent();
  }

  /**
   * Returns the observed model that was passed to the current form script running. If there is
   * no form script, this method will return NULL.
   * @returns
   */
  public getObservedScriptModel() {
    return this.scriptingScope ? this.scriptingScope.getModel() : null;
  }

  // Create a reactive form from the enaio form model
  private buildReactiveForm(formOptions) {
    this.scriptingScope = null;
    this.scriptModel = {};
    const formModel = this.dataToForm(formOptions.formModel, formOptions.data);

    if (!formModel) {
      return;
    }
    // if a script is available, we'll init the form scripting for the
    // current form
    if (this.isInnerTableForm || (formModel.script && formModel.script.length > 0)) {
      this.logger.debug('adding form scripting scope');
      this.scriptingScope = new ObjectFormScriptingScope(formModel.situation, this.onScriptingModelChanged, this.pluginService.getApi(), this.isInnerTableForm);
      this.scriptingScope.objectId = this.formOptions.objectId;
    }

    const form = new ObjectFormGroup({});
    if (formModel?.elements[0]?.elements) {
      this.addFormControl(form, formModel.elements[0], 'core');
    }
    if (formModel?.elements[1]?.elements) {
      this.addFormControl(form, formModel.elements[1], 'data');
    }
    this.form = form;

    setTimeout(() => {
      this.initValidators(this.form);
      const formWatch = this.form.valueChanges.pipe(debounceTime(500)).subscribe(() => !formWatch.closed && this.emitFormChangedEvent());
      this.subscriptions.push(formWatch);

      this.initScriptingScope(formOptions, formModel);

      this.onFormReady.emit();
      this.emitFormChangedEvent(false);
    }, 300);
  }

  initValidators(form) {
    if (this.form) {
      for (const key of Object.keys(form.controls)) {
        const control = form.controls[key];
        if (control.controls) {
          this.initValidators(control);
        } else {
          this.initialValidators[control._eoFormElement.name] = control.validator;
          control.setValidators(Validators.compose(this.getValidators(control._eoFormElement).concat([this.initialValidators[control._eoFormElement.name]])));
          control.updateValueAndValidity();
        }
      }
    }
  }

  private emitFormChangedEvent(compare = true) {
    // check if indexdata has been changed
    let currentFormData = this.getFormData();
    let idxChange = compare ? JSON.stringify(this.formData) !== JSON.stringify(currentFormData) : false;
    this.formData = currentFormData;
    if (this.form) {
      this.statusChanged.emit({
        invalid: this.form.invalid,
        dirty: this.form.dirty,
        data: this.formData,
        indexdataChanged: idxChange
      });
    }
  }

  /**
   * This method will be called each time the script changes its internal model.
   * It is used to transfer the script changes to the actual form model.
   *
   * To ensure the right context, we define an instance method as callback for the scripting scope
   * @see: https://blog.johnnyreilly.com/2014/04/typescript-instance-methods.html
   *
   * @param formControlName
   * @param change
   */
  private onScriptingModelChanged = (formControlName, change) => {
    // find the target control
    let fc: ObjectFormControl = this.formControls[formControlName] as ObjectFormControl;
    if (fc) {
      // change only allowed properties
      switch (change.name) {
        case 'value': {
          if (Array.isArray(change.newValue)) {
            this.processArrayValueChange(fc, change);
          } else {
            fc._eoFormElement.value = change.newValue;
            if (fc.value !== change.newValue) {
              fc.patchValue(change.newValue);
              fc.updateValueAndValidity();
              fc.markAsDirty();
            }
          }
          this.form.markAsDirty();
          break;
        }
        case 'required': {
          fc._eoFormElement.required = change.newValue;
          // apply new validators
          // @see: https://scotch.io/tutorials/how-to-implement-conditional-validation-in-angular-2-model-driven-forms
          fc.setValidators(Validators.compose(this.getValidators(fc._eoFormElement).concat([this.initialValidators[fc._eoFormElement.name]])));
          // need to mark form control as touched because otherwise form validation will not show
          // error messages
          fc.markAsTouched();
          fc.updateValueAndValidity();
          break;
        }
        case 'readonly': {
          fc._eoFormElement.readonly = change.newValue;
          if (change.newValue === true) {
            fc.disable();
          } else {
            fc.enable();
          }
          break;
        }
        case 'error': {
          fc._eoFormElement.error = change.newValue;
          fc.markAsTouched();
          fc.updateValueAndValidity();
          break;
        }
        // new onrowedit function was applied by the script
        case 'onrowedit': {
          fc._eoFormElement.onrowedit = change.newValue;
          break;
        }
        // new onchange function was applied by the script
        case 'onchange': {
          fc._eoFormElement.onchange = change.newValue;
          break;
        }
      }
    }
  };

  private processArrayValueChange(fc, change) {
    const newVal = change.newValue;
    // const targetType = fc._eoFormElement.type;
    // // for some types we have to ensure that meta data are provided as well
    // switch (targetType) {
    //   case 'ORGANIZATION': {
    //     this.getDataMeta(fc._eoFormElement, newVal).subscribe(m => {
    //       fc._eoFormElement.dataMeta = m;
    //     });
    //     break;
    //   }
    //   case 'CODESYSTEM': {
    //     if (!fc._eoFormElement.codesystem.entries) {
    //        fc._eoFormElement.codesystem = this.systemService.getCodesystem(fc._eoFormElement.codesystem.id);
    //     }
    //     break;
    //   }
    //   case 'TABLE': {
    //     const dataToBeProcessed = {};
    //     fc._eoFormElement.elements.forEach(e => {
    //        if (e.type === 'ORGANIZATION' || e.type === 'CODESYSTEM') {
    //         dataToBeProcessed[e.name] = e;
    //       }
    //     });
    //     if (Object.keys(dataToBeProcessed).length) {
    //       newVal.forEach(rowData => {
    //         Object.keys(rowData).forEach(key => {
    //           if (dataToBeProcessed[key]) {
    //             this.getDataMeta(dataToBeProcessed[key], rowData[key]).subscribe(m => {
    //               if (m) {
    //                 rowData[key + '_meta'] = m;
    //               } else {
    //                 delete rowData[key + '_meta'];
    //               }
    //               this.updateArrayValue(fc, newVal);
    //             });
    //           }
    //         });
    //       });
    //     }
    //     break;
    //   }
    // }
    this.updateArrayValue(fc, newVal);
  }

  private updateArrayValue(fc, newValue) {
    fc._eoFormElement.value = [].concat(newValue);
    fc.patchValue([].concat(newValue));
    fc.updateValueAndValidity();
    fc.markAsDirty();
  }

  // private getDataMeta(formElement: any, newValue: any): Observable<any> {
  //   if (newValue) {
  //     switch (formElement.type) {
  //       case 'ORGANIZATION': {
  //         return this.systemService.getOrganizationObject(newValue);
  //       }
  //       case 'CODESYSTEM': {
  //         return observableOf(this.systemService.getCodesystem(formElement.codesystem.id).entries.find((entry)=>{
  //   return entry.defaultrepresentation === newValue;
  // }));
  //         break;
  //       }
  //     }
  //   }
  //   return of(null);
  // }

  private patchFormValue(formValue: string[] | string) {
    let value: any;
    if (Array.isArray(formValue)) {
      value = [];
      // copy by value for arrays of objects (e.g. table data)
      formValue.forEach((o) => value.push(JSON.parse(JSON.stringify(o))));
    } else {
      value = formValue;
    }
    return value;
  }

  /**
   * Recursive method adding a new FormControl (group or control) to a parent form group
   *
   * @param parentGroup - the parent group to add the control to
   * @param formElement - the enaio form model element to create the child control from
   * @param [useName] - use this name instead of the one from the model
   */
  private addFormControl(parentGroup: ObjectFormGroup, formElement: any, useName?: string) {
    let ctrl;
    let name;

    // add a form group
    if (formElement.type === 'o2mGroup' || formElement.type === 'o2mGroupStack') {
      // do not add groups that are empty
      if (!formElement.elements || formElement.elements.length === 0) {
        this.logger.error('Found empty form group', formElement);
        return;
      }

      ctrl = new ObjectFormGroup({});
      ctrl._eoFormGroup = {
        // label: formElement.label,
        label: formElement.name ? this.systemService.getLocalizedResource(`${formElement.name}_label`) || formElement.name : '???',
        layout: formElement.layout,
        type: formElement.type
      };

      if (useName === 'core' || useName === 'data') {
        ctrl._eoFormGroup.label = useName;
      }

      for (let e of formElement.elements) {
        this.addFormControl(ctrl, e);
      }
      name = useName || 'fg' + this.gCount++;
    } else {
      // add form control
      // To be able to integrate recursive form controls into the main form,
      // we have to wrap them in a form group
      ctrl = new ObjectFormControlWrapper({});
      ctrl._eoFormControlWrapper = {
        // the name of the wrapped FormControl
        controlName: formElement.name,
        situation: this.formOptions.formModel.situation
      };

      // do not set a reference as the form controls value
      // otherwise we could not reset the form
      let value: any;
      value = formElement?.value
        ? this.patchFormValue(formElement?.value)
        : formElement?.defaultvalue && this.formOptions.formModel.situation === Situation.CREATE
        ? this.patchFormValue(formElement?.defaultvalue)
        : formElement?.value;

      // // for codesystem elements add entries if not yet provided
      // if (formElement.type === 'CODESYSTEM' && !formElement.codesystem.entries) {
      //   formElement.codesystem = this.systemService.getCodesystem(formElement.codesystem.id);
      // }

      // create the actual form control
      const controlDisabled = this.formOptions.disabled || !!formElement.readonly;
      const formControl = new ObjectFormControl({
        value,
        disabled: controlDisabled
      });

      formElement.label = formElement.name ? this.systemService.getLocalizedResource(`${formElement.name}_label`) || formElement.name : '???';
      formElement.readonly = controlDisabled;
      // we are using an internal type to distinguish between the components
      // to be used to render certain form elements
      formElement._internalType = this.systemService.getInternalFormElementType(formElement, 'type');

      formControl._eoFormElement = formElement;
      this.formControls[formElement.name] = formControl;

      if (formElement.type === 'TABLE') {
        // Add 'onrowedit' property even if it's not set.
        // This is required because otherwise mobX-Observer would not recognize
        // changes to this property applied by the form script
        if (!formControl._eoFormElement.hasOwnProperty('onrowedit')) {
          formControl._eoFormElement.onrowedit = null;
        }

        if (this.scriptingScope && formControl._eoFormElement.value) {
          // having a scripting scope and table rows means that we need to set empty
          // columns to NULL, because otherwise mobX won't be able to track those values
          const valueFields = formControl._eoFormElement.elements.map((e) => e.name);
          formControl._eoFormElement.value.forEach((rowValue) => {
            valueFields.forEach((valueField) => {
              if (!rowValue.hasOwnProperty(valueField)) {
                rowValue[valueField] = null;
              }
            });
          });
          // update form controls value as well to reflect the observed value
          formControl.patchValue(formControl._eoFormElement.value, {
            onlySelf: true,
            emitEvent: false,
            emitModelToViewChange: false,
            emitViewToModelChange: false
          });
        }
      }

      // if (formElement.type === 'CODESYSTEM' || (formElement.type === 'STRING' && formElement.classification === 'selector')) {
      //   formControl._eoFormElement.applyFilter = (func: Function) => {
      //     formControl._eoFormElement.filterFunction = func;
      //   };
      // }

      // if (formElement.type === 'STRING' && formElement.classification === 'selector') {
      //   formControl._eoFormElement.setList = (listObject: any) => {
      //     formControl._eoFormElement.list = listObject;
      //   };
      // }

      if (formElement._internalType === 'string:organization') {
        formControl._eoFormElement.setFilter = (filterObject: any) => {
          formControl._eoFormElement.filter = filterObject;
        };
      }

      ObjectFormUtils.updateFormElement(formElement);

      if (this.formOptions.formModel.situation === Situation.SEARCH) {
        // in search situation even readonly fields should be editable ...
        formControl._eoFormElement.readonly = false;
        // ... and required makes no sense here
        formControl._eoFormElement.required = false;
      }

      // remove empty descriptions
      const desc = formControl._eoFormElement.description;
      if (desc && desc.trim().length === 0) {
        formControl._eoFormElement.description = null;
      }

      // add the form element to the script model that will be injected into
      // the forms scripting scope later on
      this.scriptModel[formElement.name] = formControl._eoFormElement;

      // apply change listener to the form control, that will trigger
      // the form elements onChange listener
      const controlWatch = ctrl.valueChanges.pipe(debounceTime(500));
      controlWatch.subscribe((v) => {
        if (this.scriptingScope) {
          this.scriptingScope.modelChanged(v);
        }
      });
      this.subscriptions.push(controlWatch);

      ctrl.addControl(formElement.name, formControl);
      name = 'fg_' + formElement.name;
    }
    parentGroup.addControl(name, ctrl);
  }

  /**
   * Build validators for the given form element to be attached to
   * a reactive formControl.
   *
   * @param formElement - form element object
   */
  private getValidators(formElement: any): ValidatorFn[] {
    const elmValidators = FormValidation.getValidators(formElement, this.formOptions.formModel.situation);

    // add custom validator for script enabled forms
    if (this.scriptingScope) {
      elmValidators.push(FormValidation.customScriptingValidation);
    }

    return elmValidators;
  }

  /**
   * Extract the values from the form
   */
  private formToData() {
    return this.formHelperService.extractFormData(this.form, this.formOptions.formModel.situation, this.formOptions.data, this.isInnerTableForm);
  }

  /**
   * Merge data into a form model.
   *
   * @param model - form model
   * @param data - data object or array of SearchFilter objects in case of a search form
   */
  private dataToForm(model: any, data: any) {
    if (model && data) {
      this.setElementValues(model.elements, data);
    }
    return model;
  }

  // recursive method for adding values to model elements
  private setElementValues(elements, data) {
    elements.forEach((element) => {
      if (this.hasValue(data, element)) {
        element.value = this.getValue(data, element);
        if (element.value) {
          // add meta data for some of the types
          this.fetchMetaData(data, element);
        }
      } else {
        delete element.value;
      }
      if (element.type !== 'TABLE' && element.elements && element.elements.length > 0) {
        this.setElementValues(element.elements, data);
      }
    });
  }

  // in some cases required meta data may not be available on the element itself
  // so they have to be fetched and added to the element for the form to be able
  // to render the element correctly
  private fetchMetaData(data, element) {
    if (this.formOptions.formModel.situation === Situation.SEARCH) {
      // TODO: how to fetch meta data in search situation
    } else {
      // TODO: Not supported right now
      // if (element.type === 'ORGANIZATION' && data[element.name + '_meta']) {
      //   element.dataMeta = data[element.name + '_meta'];
      // } else if (element.type === 'CODESYSTEM' && data[element.name + '_meta']) {
      //   element.dataMeta = data[element.name + '_meta'];
      //   element.defaultrepresentation = data[element.name + '_meta'].defaultrepresentation;
      // } else if (element.type === 'REFERENCE' && data[element.name + '_meta']) {
      //   element.dataMeta = data[element.name + '_meta'];
      // }
    }
  }

  private hasValue(data, element) {
    // differ between array of SearchFilters and a form data object
    if (Array.isArray(data)) {
      return !!data.find((filter) => filter.property === element.id);
    } else {
      return data.hasOwnProperty(element.name);
    }
  }

  private getValue(data, element) {
    let value;
    if (this.formOptions.formModel.situation === Situation.SEARCH) {
      // Differ between fields that support ranges and the ones that don't.
      // In search situation fields get their values from SearchFilters. The so called
      // inner table forms are the ones used by the table lement to edit its rows. They
      // have to be treated differently to provide the right value.
      if (['datetime', 'integer', 'decimal'].includes(element.type)) {
        value = this.isInnerTableForm
          ? SearchService.toRangeValue(data[element.name])
          : this.searchFilterToRangeValue(data.find((filter) => filter.property === element.id));
      } else {
        if (this.isInnerTableForm) {
          value = data[element.name];
        } else {
          const filter: SearchFilter = data.find((f) => f.property === element.id);
          // take care of searches for explicit NULL values
          if (filter.operator === SearchFilter.OPERATOR.EQUAL && filter.firstValue === null) {
            element.isNotSetValue = true;
          }
          value = this.searchFilterToValue(filter);
        }
        //
        // value = this.isInnerTableForm ?
        //   data[element.name] :
        //   this.searchFilterToValue(data.find((filter) => filter.property === element.id));
      }
    } else {
      if (['datetime'].includes(element.type) && data[element.name]) {
        value = new Date(data[element.name]);
      } else {
        value = data[element.name];
      }
    }
    return value;
  }

  // transforms a searchFilter into a value consumable by the form elements that not support ranges
  private searchFilterToValue(searchFilter: SearchFilter): any {
    if (searchFilter) {
      return searchFilter.firstValue;
    } else {
      return undefined;
    }
  }

  // transforms a searchFilter int a rangeValue instance which then can be used
  // as value for form controls that support ranges
  private searchFilterToRangeValue(searchFilter: SearchFilter): RangeValue {
    if (searchFilter) {
      return new RangeValue(searchFilter.operator, searchFilter.firstValue, searchFilter.secondValue);
    } else {
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribeAll();
  }

  ngAfterViewInit() {
    this.cdRef.detectChanges();
  }

  // unsubscribe from all value change listeners for the current form
  // to avoid memory leaks. This method will also be called every time
  // a new form is rendered to get rid of the old form element subscriptions
  private unsubscribeAll() {
    if (this.subscriptions.length) {
      this.logger.debug('unsubscribed from ' + this.subscriptions.length + ' value change listeners.');
      this.subscriptions.forEach((s) => s.unsubscribe());
      this.subscriptions = [];
    }
  }
}
