import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppCacheService, TranslateService, Utils } from '@yuuvis/core';
import { SequenceItem, SequenceListTemplate } from '../sequence-list/sequence-list.interface';

@Component({
  selector: 'yuv-sequence-list-template-manage',
  templateUrl: './sequence-list-template-manage.component.html',
  styleUrls: ['./sequence-list-template-manage.component.scss']
})
export class SequenceListTemplateManageComponent implements OnInit {
  private TEMPLATE_STORAGE_KEY = 'yuv.sequence.list.templates';
  templates: SequenceListTemplate[] = [];

  private _currentTemplate: SequenceListTemplate;
  set currentTemplate(s: SequenceListTemplate) {
    this._currentTemplate = s;

    if (s)
      this.form.patchValue({
        templateName: s.name,
        sequence: s.sequence
      });
  }
  get currentTemplate() {
    return this._currentTemplate;
  }

  busy: boolean;
  form: FormGroup = this.fb.group({
    templateName: ['', [Validators.required, Validators.maxLength(128)]],
    sequence: [[], Validators.minLength(1)]
  });

  // private _entries: SequenceItem[] = [];
  @Input() set entries(e: SequenceItem[]) {
    this.currentTemplate = {
      name: '',
      sequence: e
    };
  }

  labels = {
    save: this.translate.instant('yuv.framework.sequence-list.template.button.save'),
    saveNew: this.translate.instant('yuv.framework.sequence-list.template.button.saveNew'),
    headline: this.translate.instant('yuv.framework.sequence-list.template.headline'),
    headlineNew: this.translate.instant('yuv.framework.sequence-list.template.headlineNew')
  };

  constructor(private appCache: AppCacheService, private fb: FormBuilder, private translate: TranslateService) {}

  deleteTemplate() {
    this.templates = this.templates.filter((t) => t.id !== this.currentTemplate.id);
    this.currentTemplate = undefined;
    this.saveTemplates();
  }

  submit() {
    if (this.currentTemplate) {
      // update existing template
      const i = this.templates.findIndex((e) => e.id === this.currentTemplate.id);
      if (i !== -1) {
        this.templates[i] = {
          id: this.currentTemplate.id,
          name: this.form.value.templateName,
          sequence: this.form.value.sequence
        };
      } else {
        this.templates.push({
          id: Utils.uuid(),
          name: this.form.value.templateName,
          sequence: this.form.value.sequence
        });
      }
      this.currentTemplate = undefined;
      this.saveTemplates();
    }
  }

  // saveAsTemplate(templateName: string, entries: SequenceItem[]) {
  //   if (templateName && entries.length) {
  //     this.templates.push({
  //       name: templateName,
  //       sequence: [...entries]
  //     });
  //     this.saveTemplates();
  //   }
  // }

  private saveTemplates() {
    this.busy = true;
    this.appCache.setItem(this.TEMPLATE_STORAGE_KEY, this.templates).subscribe(
      (res) => {
        this.busy = false;
        // this.popoverRef.close();
      },
      (err) => (this.busy = false)
    );
  }

  private loadTemplates() {
    // TODO: Write to userservice
    // this.backend.get('users/settings').subscribe()
    this.appCache.getItem(this.TEMPLATE_STORAGE_KEY).subscribe((res) => (this.templates = res || []));
  }

  ngOnInit(): void {
    this.loadTemplates();
  }
}
