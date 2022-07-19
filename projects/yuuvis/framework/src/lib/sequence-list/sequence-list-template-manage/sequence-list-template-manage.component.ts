import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppCacheService, TranslateService, Utils } from '@yuuvis/core';
import { PopoverService } from '../../popover/popover.service';
import { SequenceItem, SequenceListTemplate } from '../sequence-list/sequence-list.interface';

@Component({
  selector: 'yuv-sequence-list-template-manage',
  templateUrl: './sequence-list-template-manage.component.html',
  styleUrls: ['./sequence-list-template-manage.component.scss']
})
export class SequenceListTemplateManageComponent implements OnInit {
  private TEMPLATE_STORAGE_KEY = 'yuv.sequence.list.templates';
  CURRENT_ENTRIES_ID = 'current';

  templates: SequenceListTemplate[] = [];
  filterTerm: string;

  private _selectedTemplate: SequenceListTemplate;
  set selectedTemplate(s: SequenceListTemplate) {
    this._selectedTemplate = s;

    if (s)
      this.form.patchValue({
        templateName: s.id === this.CURRENT_ENTRIES_ID ? '' : s.name,
        sequence: s.sequence
      });
    this.form.markAsPristine();
  }
  get selectedTemplate() {
    return this._selectedTemplate;
  }

  busy: boolean;
  form: FormGroup = this.fb.group({
    templateName: ['', [Validators.required, Validators.maxLength(128)]],
    sequence: [[], Validators.minLength(1)]
  });

  @Input() currentEntries: SequenceItem[];

  // emitted once a template has been selected
  @Output() templateSelect = new EventEmitter<SequenceItem[]>();
  @Output() cancel = new EventEmitter<any>();

  labels = {
    save: this.translate.instant('yuv.framework.sequence-list.template.button.save'),
    saveNew: this.translate.instant('yuv.framework.sequence-list.template.button.saveNew'),
    headline: this.translate.instant('yuv.framework.sequence-list.template.headline'),
    headlineNew: this.translate.instant('yuv.framework.sequence-list.template.headlineNew')
  };

  constructor(private appCache: AppCacheService, private popover: PopoverService, private fb: FormBuilder, private translate: TranslateService) {}

  selectCurrentEntries() {
    this.selectedTemplate = {
      id: this.CURRENT_ENTRIES_ID,
      name: this.translate.instant('yuv.framework.sequence-list.template.headlineNew'),
      sequence: this.currentEntries
    };
  }

  applyTemplate() {
    this.templateSelect.emit(this.selectedTemplate.sequence);
  }

  deleteTemplate() {
    this.popover
      .confirm({
        message: this.translate.instant('yuv.framework.sequence-list.template.remove.confirm.message', {
          template: this.selectedTemplate.name
        })
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.templates = this.templates.filter((t) => t.id !== this.selectedTemplate.id);
          this.selectedTemplate = undefined;
          this.saveTemplates();
        }
      });
  }

  submit() {
    if (this.selectedTemplate) {
      if (this.selectedTemplate.id === this.CURRENT_ENTRIES_ID) {
        // save current list as new template
        this.templates.push({
          id: Utils.uuid(),
          name: this.form.value.templateName,
          sequence: this.form.value.sequence
        });
      } else {
        // update existing template
        const i = this.templates.findIndex((e) => e.id === this.selectedTemplate.id);
        if (i !== -1) {
          this.templates[i] = {
            id: this.selectedTemplate.id,
            name: this.form.value.templateName,
            sequence: this.form.value.sequence
          };
        }
      }
      this.selectedTemplate = undefined;
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
    this.appCache.getItem(this.TEMPLATE_STORAGE_KEY).subscribe((res) => {
      this.templates = res || [];
      // this.addCurrentEntries();
    });
  }

  // private addCurrentEntries() {
  //   if (this._currentEntries?.length && this.templates && this.templates.findIndex((t) => t.id === this.CURRENT_ENTRIES_ID) === -1) {
  //     this.templates.unshift({
  //       id: this.CURRENT_ENTRIES_ID,
  //       name: this.translate.instant('yuv.framework.sequence-list.template.headlineNew'),
  //       sequence: this._currentEntries
  //     });
  //   }
  // }

  ngOnInit(): void {
    this.loadTemplates();
  }
}
