import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BackendService, PendingChangesService, TranslateService, Utils } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { PopoverService } from '../../popover/popover.service';
import { SequenceItem, SequenceListTemplate } from '../sequence-list/sequence-list.interface';

@Component({
  selector: 'yuv-sequence-list-template-manage',
  templateUrl: './sequence-list-template-manage.component.html',
  styleUrls: ['./sequence-list-template-manage.component.scss']
})
export class SequenceListTemplateManageComponent implements OnInit, OnDestroy {
  private DEFAULT_TEMPLATE_STORAGE_SECTION = 'sequencelist';
  CURRENT_ENTRIES_ID = 'current';
  TEMPLATE_NAME_MAX_LENGTH = 128;

  templates: SequenceListTemplate[] = [];
  filterTerm: string;
  pendingTaskId: string;

  private _selectedTemplate: SequenceListTemplate;
  set selectedTemplate(s: SequenceListTemplate) {
    if (!this.pendingChanges.check()) {
      this.pendingTaskId = undefined;
      this._selectedTemplate = { ...s };

      if (this._selectedTemplate)
        this.form.patchValue(
          {
            templateName: this._selectedTemplate.id === this.CURRENT_ENTRIES_ID ? '' : this._selectedTemplate.name,
            sequence: [...this._selectedTemplate.sequence]
          },
          { emitEvent: false }
        );
      this.form.markAsPristine();
    }
  }
  get selectedTemplate() {
    return this._selectedTemplate;
  }

  busy: boolean;
  form: FormGroup = this.fb.group({
    templateName: ['', [Validators.required, Validators.maxLength(this.TEMPLATE_NAME_MAX_LENGTH), this.forbiddenNameValidator()]],
    sequence: [[], Validators.required]
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
    headlineNew: this.translate.instant('yuv.framework.sequence-list.template.headlineNew'),
    errors: {
      maxlength: this.translate.instant('yuv.framework.object-form-element.error.maxlength', { maxLength: this.TEMPLATE_NAME_MAX_LENGTH }),
      forbiddenName: this.translate.instant('yuv.framework.sequence-list.template.errors.forbiddenName')
    }
  };

  get formErrors() {
    const errors = this.form.get('templateName').errors;
    return errors ? Object.keys(errors).map((k) => this.labels.errors[k]) : [];
  }

  constructor(
    private backend: BackendService,
    private popover: PopoverService,
    private pendingChanges: PendingChangesService,
    private fb: FormBuilder,
    private translate: TranslateService
  ) {
    this.form.statusChanges.pipe(takeUntilDestroy(this)).subscribe((res) => {
      if (this.form.dirty && !this.pendingChanges.hasPendingTask(this.pendingTaskId || ' ')) {
        this.pendingTaskId = this.pendingChanges.startTask(this.translate.instant('yuv.framework.sequence-list.template.pending-changes.alert'));
      }
    });
  }

  private forbiddenNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = this.templates
        .filter((t) => t.id !== this.selectedTemplate.id)
        .map((t) => t.name)
        .includes(control.value);
      return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
  }

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
      this.saveTemplates();
    }
  }

  private saveTemplates() {
    this.busy = true;
    return this.backend.post(`/users/settings/${this.storageSection}`, { templates: this.templates }).subscribe(
      (res) => {
        this.busy = false;
        this.form.markAsPristine();
        if (this.pendingTaskId) this.pendingChanges.finishTask(this.pendingTaskId);
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
  ngOnDestroy(): void {}
}
