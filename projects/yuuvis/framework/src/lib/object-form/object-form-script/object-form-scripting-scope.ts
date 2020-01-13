import { cloneDeep } from 'lodash-es';

// This class will be injected as scope into form scripts
// to enable simple way of scripting and assure backward compatibility we use
// MobX.observe to track changes on the scripting model.
// @see: https://medium.com/@mweststrate/object-observe-is-dead-long-live-mobservable-observe-ad96930140c5
export class ObjectFormScriptingScope {
  // List of all form fields (elements)
  public model: any = {};

  // all data values including invisible elements (READONLY)
  public data: any = {};

  // actions passed by BPM forms
  public actions: any = {};
  // additional objects provided by the object form
  // used for example to pass dms objects attached to a work item
  // to the script (READONLY)
  // may contain: FormScriptDmsObject, FileEntry
  public objects: any[] = [];
  public context: { id: string; title: string; objectTypeId: string } = { id: '', title: '', objectTypeId: '' };

  /**
   * Constructor
   * @param situation - Current form model situation (could be CREATE, SEARCH or EDIT)
   * @param onScriptingModelChange - callback function to be called when the scripting model changed
   * Be aware to provide an instance method as callback for the scripting scope.
   * @see: https://blog.johnnyreilly.com/2014/04/typescript-instance-methods.html
   *
   * @param api - Plugin API reference
   * @param isTableRowScope - set this to true if the current scripting scope is created for a
   * row editing form from a table element. It will then provide the right parameters for the scripting functions
   */
  constructor(public situation: string, private onScriptingModelChange: Function, public api: any, private isTableRowScope?: boolean) {}

  /**
   * Sets the internal model and wraps every model element with an observer to be
   * able to track their changes from within a form script
   * @param model
   */
  public setModel(model: any) {
    this.model = {};
    for (let k of Object.keys(model)) {
      this.model[k] = new ScopeElement(model[k], this.onScriptingModelChange);
    }
  }

  /**
   * Returns the observed model. Used for row editing forms of table elements that
   * create their own scripting scope in context of their parent form.
   * @returns the observed scripting scope model
   */
  public getModel() {
    return this.model;
  }

  /**
   * Called by the object form when the form model changes.
   * @param change - object with key equals name of the element
   * that changes and value of the new value
   */
  public modelChanged(change: any) {
    // find the changed element in the scopes model
    let propertyName = Object.keys(change)[0];
    if (change[propertyName] === undefined) {
      return;
    }

    if (this.model[propertyName]) {
      let el = this.model[propertyName];
      el.update(change[propertyName], this.model);
    }
  }
}

class ScopeElement {
  constructor(private element: any, private onScriptingModelChange: Function) {
    if (this.element.value === undefined) {
      this.element.value = null;
    }
    if (this.isProxyable(this.element.value)) {
      this.element.value = this.createProxy(this.element.value);
    }
  }

  private isProxyable(value, key?: string) {
    return (
      (typeof value === 'object' || Array.isArray(value)) &&
      value !== null &&
      !(value instanceof Date) &&
      !value.isProxy &&
      (key ? !key.includes('_meta') : true)
    );
  }

  private createProxy(value) {
    const handler = {
      set: (target, key, val) => {
        const previousValue = cloneDeep(this.element.value);
        if (this.isProxyable(val, key)) {
          target[key] = this.createProxy(val);
        } else {
          target[key] = val;
        }
        if (this.hasValueChanged(this.element.value, previousValue) && !key.includes('_meta')) {
          this.onScriptingModelChange(this.element.name, { newValue: cloneDeep(this.element.value), name: 'value' });
        }
        return true;
      },
      // This get trap is only used to find out, if an object is a proxy or not.
      get: (target, key) => {
        if (key === 'isProxy') {
          return true;
        }
        return target[key];
      }
    };

    Object.keys(value).forEach(key => {
      if (this.isProxyable(value[key], key)) {
        value[key] = this.createProxy(value[key]);
      }
    });
    return new Proxy(value, handler);
  }

  private hasValueChanged(value1, value2) {
    return JSON.stringify(value1) !== JSON.stringify(value2);
  }

  update(value, model) {
    const newValue = cloneDeep(value);
    if (this.hasValueChanged(this.element.value, value)) {
      if (this.isProxyable(value)) {
        this.element.value = this.createProxy(newValue);
      } else {
        this.element.value = newValue;
      }
      if (this.element.onchange) {
        this.element.onchange(this, model);
      }
    }
  }

  set value(value) {
    if (this.hasValueChanged(this.element.value, value)) {
      if (this.isProxyable(value)) {
        this.element.value = this.createProxy(value);
      } else {
        this.element.value = value;
      }
      this.onScriptingModelChange(this.element.name, { newValue: cloneDeep(this.element.value), name: 'value' });
    }
  }

  get value() {
    return this.element.value;
  }

  set onchange(onchange) {
    this.element.onchange = onchange;
    this.onScriptingModelChange(this.element.name, { newValue: onchange, name: 'onchange' });
  }

  get onchange() {
    return this.element.onchange;
  }

  set required(required) {
    this.element.required = required;
    this.onScriptingModelChange(this.element.name, { newValue: required, name: 'required' });
  }

  get required() {
    return this.element.required;
  }

  set readonly(readonly) {
    this.element.readonly = readonly;
    this.onScriptingModelChange(this.element.name, { newValue: readonly, name: 'readonly' });
  }

  get readonly() {
    return this.element.readonly;
  }

  set error(error) {
    this.element.error = error;
    this.onScriptingModelChange(this.element.name, { newValue: error, name: 'error' });
  }

  get error() {
    return this.element.error;
  }

  set onrowedit(onrowedit) {
    this.element.onrowedit = onrowedit;
    this.onScriptingModelChange(this.element.name, { newValue: onrowedit, name: 'onrowedit' });
  }

  get onrowedit() {
    return this.element.onrowedit;
  }

  setList(obj) {
    if (this.element.setList) {
      this.element.setList(obj);
    }
  }

  applyFilter(obj) {
    if (this.element.applyFilter) {
      this.element.applyFilter(obj);
    }
  }

  setFilter(obj) {
    if (this.element.setFilter) {
      this.element.setFilter(obj);
    }
  }

  get name() {
    return this.element.name;
  }

  get qname() {
    return this.element.qname;
  }

  get label() {
    return this.element.label;
  }

  get description() {
    return this.element.description;
  }

  get type() {
    return this.element.type;
  }

  get multiselect() {
    return this.element.multiselect;
  }

  get codesystem() {
    return this.element.codesystem;
  }

  get minlen() {
    return this.element.minLength;
  }

  get maxlen() {
    return this.element.maxLength;
  }

  get classification() {
    return this.element.classification;
  }

  get scale() {
    return this.element.scale;
  }

  get precision() {
    return this.element.precision;
  }

  get withtime() {
    return this.element.withtime;
  }

  get elements() {
    return this.element.elements;
  }

  get aliases() {
    return this.element.aliases;
  }
}
