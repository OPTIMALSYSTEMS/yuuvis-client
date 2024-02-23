import { Component, Input, ViewChild } from '@angular/core';
import { ApiBase, ConfigService, DmsObject, TranslateService } from '@yuuvis/core';
import { ObjectFormOptions } from '../object-form';
import { ObjectFormComponent } from '../object-form/object-form/object-form.component';
import { PluginComponent } from '../plugins/plugin.component';
import { PluginsService } from '../plugins/plugins.service';
import { NotificationService } from '../services/notification/notification.service';

type BpmOptions = { variables?: any[], formModel?: any, elements?: any[], formName?: string };

@Component({
  selector: 'yuv-plugin-bpm',
  template: ` 
    <div *ngIf="!formOptions" [style.height]="'200px'" [yuvBusyOverlay]="true"></div>
    <yuv-object-form *ngIf="formOptions" [formOptions]="formOptions" (statusChanged)="parent.disabled = $event.invalid"></yuv-object-form>
  `,
  styles: [
    ":host, ::ng-deep yuv-object-form {width: 100%; background: transparent;}",
    "::ng-deep yuv-object-form .yuv-object-form .core {padding-top: 0!important;}",
  ]
})
export class PluginBpmComponent {

  @ViewChild('form', { static: false }) form: ObjectFormComponent;

  @Input() parent: any;
  @Input() processDefinitionKey: string;
  @Input() successMessageKey: string;
  @Input() options: BpmOptions;
  @Input() formOptions: ObjectFormOptions;
  @Input() selection: DmsObject[];

  constructor(private pluginService: PluginsService,
    private notifications: NotificationService,
    public translate: TranslateService,
    private component: PluginComponent) {
    this.parent = this.component.parent;
  }

  init(options: any) {
    this.options = options;
    return this.options?.formModel || this.options?.elements || this.options?.formName
      ? this.initBpmForm(this.processDefinitionKey, this.successMessageKey, this.options)
      : this.postBpmProcess(this.selection[0], this.processDefinitionKey, this.successMessageKey, this.options);
  }

  /**
   * Creates new BPM process
   * @param dmsObject - selected object
   * @param processDefinitionKey - process definition key
   * @param successMessageKey - success message key
   * @param options - process variables
   * 
   * @ignore
   */
  public postBpmProcess(dmsObject: DmsObject, processDefinitionKey: string, successMessageKey: string, options?: { variables?: any[] }) {
    return this.pluginService.post('/bpm/processes', {
      businessKey: dmsObject.id,
      name: dmsObject.title || dmsObject.id,
      processDefinitionKey,
      attachments: this.selection.map((s) => s.id),
      subject: dmsObject.title,
      variables: options?.variables || []
    }, ApiBase.apiWeb)
      .then(() => this.notifications.success(this.translate.instant(successMessageKey)))
      .catch(this.handleError)
      .finally(() => this.parent?.onFinish?.());
  }

  public formModelWrapper(elements?: any[], label?: string, labelKey?: string) {
    return {
      name: 'startform',
      situation: 'EDIT',
      script: '',
      elements: [
        {
          name: 'core',
          type: 'o2mGroup',
          elements: [
            {
              name: labelKey || label || 'bpm',
              type: 'o2mGroup',
              label: labelKey ? this.translate.instant(labelKey) : (label) || '',
              elements: elements.map(e =>
              ({
                name: e.name || e,
                type: e.type || 'string',
                required: e.required || false,
                cardinality: e.cardinality || 'single',
                readonly: e.readonly || false,
                classifications: e.classifications || [],
                label: e.label,
                labelkey: e.labelKey ? this.translate.instant(e.labelKey) : (e.name || e),
                elements: e.elements,
                layout: e.layout
              })
              )
            }
          ]
        }
      ]
    };
  }

  /**
   * Creates new BPM process with form
   * @param component - plugin component
   * @param formName - form name
   * @param processDefinitionKey - process definition key
   * @param variables - process variables
   * 
   * @ignore
   */
  public initBpmForm(processDefinitionKey: string, successMessageKey: string, options?: { variables?: any[], formModel?: any, elements?: any[], formName?: string, formLabel?: string, formLabelKey?: string }) {

    if (options?.formModel || options?.elements) {
      this.formOptions = {
        formModel: options?.formModel || this.formModelWrapper(options?.elements, options?.formLabel, options?.formLabelKey),
        data: {},
        disabled: false
      };
    }

    this.formOptions?.formModel || this.pluginService.get('/resources/config/' + (options?.formName || processDefinitionKey), ApiBase.apiWeb).then((res) => {
      this.formOptions = {
        formModel: ConfigService.PARSER(res.data),
        data: {},
        disabled: false
      }
    }).catch(this.handleError);

    this.parent.finished.subscribe((event) => {
      const vars = options?.variables?.map((v) => {
        const name = typeof v === 'string' ? v : v.name;
        const value = typeof v.value === 'function' ? v.value(this.form.getFormData()[name]) : v.value === undefined ? this.form.getFormData()[name] : v.value;
        const type = v.type || typeof value;
        return {
          name: name,
          type: type === 'object' ? 'json' : type,
          value
        };
      });
      this.postBpmProcess(this.selection[0], processDefinitionKey, successMessageKey, { variables: vars });
    });
  }

  private handleError(error: any): Promise<any> {
    return Promise.reject(error.message || error);
  }

  ngOnInit() {
    this.init(this.options);
  }
}
