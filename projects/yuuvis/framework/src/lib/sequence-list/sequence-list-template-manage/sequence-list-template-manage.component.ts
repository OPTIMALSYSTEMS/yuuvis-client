import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendService, TranslateService, Utils } from '@yuuvis/core';
import { PopoverService } from '../../popover/popover.service';
import { SequenceItem, SequenceListTemplate } from '../sequence-list/sequence-list.interface';

@Component({
  selector: 'yuv-sequence-list-template-manage',
  templateUrl: './sequence-list-template-manage.component.html',
  styleUrls: ['./sequence-list-template-manage.component.scss']
})
export class SequenceListTemplateManageComponent implements OnInit {
  private DEFAULT_TEMPLATE_STORAGE_SECTION = 'sequencelist';
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

  /**
   * Name of the section to store templates in user service (usersettings)
   */
  @Input() storageSection: string = this.DEFAULT_TEMPLATE_STORAGE_SECTION;
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

  constructor(private backend: BackendService, private popover: PopoverService, private fb: FormBuilder, private translate: TranslateService) {}

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

  private saveTemplates() {
    this.busy = true;
    this.backend.post(`/users/settings/${this.storageSection}`, { templates: this.templates }).subscribe(
      (res) => {
        this.busy = false;
      },
      (err) => (this.busy = false)
    );
  }

  private loadTemplates() {
    this.backend.get(`/users/settings/${this.storageSection}`).subscribe((res) => {
      this.templates = res ? res.templates || [] : [];
    });
  }

  ngOnInit(): void {
    this.loadTemplates();
  }
}
