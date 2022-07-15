import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Attribute, Component, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppCacheService, BackendService } from '@yuuvis/core';
import { Subscription } from 'rxjs';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { OrganizationComponent } from '../../form/elements/organization/organization.component';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { addCircle, deleteIcon, dragHandle, edit } from '../../svg.generated';
import { SequenceItem, SequenceListTemplate } from './sequence-list.interface';

@Component({
  selector: 'yuv-sequence-list',
  templateUrl: './sequence-list.component.html',
  styleUrls: ['./sequence-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SequenceListComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => SequenceListComponent),
      multi: true
    }
  ]
})
export class SequenceListComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy {
  @ViewChild(OrganizationComponent) orgComponent: OrganizationComponent;
  @ViewChild('tplTemplatePicker') tplTemplatePicker: TemplateRef<any>;
  @ViewChild('tplTemplateSave') tplTemplateSave: TemplateRef<any>;

  private TEMPLATE_STORAGE_KEY = 'yuv.sequence.list.templates';

  entryForm: FormGroup;
  entryFormSubscription: Subscription | undefined;
  templates: SequenceListTemplate[] = [];
  entries: SequenceItem[] = [];
  editIndex: number;
  addTargetIndex: number;
  labels = {
    addTitle: this.translate.instant('yuv.framework.sequence-list.form.title.add'),
    addButton: this.translate.instant('yuv.framework.sequence-list.form.button.add'),
    editTitle: this.translate.instant('yuv.framework.sequence-list.form.title.edit'),
    editButton: this.translate.instant('yuv.framework.sequence-list.form.button.edit')
  };
  private popoverRef: PopoverRef;
  savingTemplates: boolean;
  templateName: string;

  private _templatesEnabled = false;
  @Input() set templatesEnabled(b: boolean) {
    this._templatesEnabled = b;
    if (b) {
      this.loadTemplates();
    } else {
      this.templates = [];
    }
  }
  get templatesEnabled() {
    return this._templatesEnabled;
  }
  @Output() itemEdit = new EventEmitter<boolean>();

  constructor(
    @Attribute('form-open') public formOpen: string,
    private elRef: ElementRef,
    private backend: BackendService,
    private appCache: AppCacheService,
    private fb: FormBuilder,
    private popover: PopoverService,
    private translate: TranslateService,
    private iconRegistry: IconRegistryService
  ) {
    this.iconRegistry.registerIcons([dragHandle, deleteIcon, edit, addCircle]);
    if (formOpen) this.showEntryForm();
  }

  propagateChange = (_: any) => {};

  private propagate() {
    this.propagateChange(this.entries);
  }

  writeValue(value: SequenceItem[]): void {
    this.entries = value || [];
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  showEntryForm(index?: number, addAtIndex?: boolean) {
    let entry;
    if (addAtIndex) {
      this.addTargetIndex = index;
    } else {
      this.editIndex = index;
      entry = index !== undefined ? this.entries[index] : undefined;
    }

    this.entryForm = this.fb.group({
      title: [entry?.title || '', Validators.required],
      nextAssignee: [entry?.nextAssignee || '', Validators.required],
      expiryDatetime: [entry?.expiryDatetime || '']
    });
    this.itemEdit.emit(true);
  }

  hideEntryForm() {
    if (this.entryFormSubscription) this.entryFormSubscription.unsubscribe();
    this.addTargetIndex = undefined;
    this.editIndex = undefined;
    this.entryForm = undefined;
    this.itemEdit.emit(false);

    setTimeout(() => {
      this.elRef.nativeElement.querySelector('#add-item ').focus();
    });
  }

  editEntry(index: number) {
    this.showEntryForm(index);
  }

  saveEntry() {
    const { title, nextAssignee, expiryDatetime } = this.entryForm.value;
    let entry: SequenceItem = {
      title,
      nextAssignee,
      nextAssignee_title: this.orgComponent._innerValue[0].getFullName()
    };
    if (expiryDatetime?.length) {
      entry.expiryDatetime = expiryDatetime;
    }

    if (this.editIndex !== undefined) {
      this.entries.splice(this.editIndex, 1, entry);
    } else if (this.addTargetIndex !== undefined) {
      this.entries.splice(this.addTargetIndex, 0, entry);
    } else {
      this.entries.push(entry);
    }
    this.hideEntryForm();
    this.propagate();
  }

  removeEntry(index: number) {
    const entry = this.entries[index];
    if (!entry) return;
    this.popover
      .confirm({
        message: this.translate.instant('yuv.framework.sequence-list.entry.remove.confirm.message', {
          task: entry.title
        })
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.entries.splice(index, 1);
          this.propagate();
        }
      });
  }

  dragDrop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.entries, event.previousIndex, event.currentIndex);
    this.propagate();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.entryForm?.dirty
      ? {
          routinglist: { pending: true }
        }
      : null;
  }

  // TEMPLATES
  openTemplatePickerOverlay() {
    this.popoverRef = this.popover.open(this.tplTemplatePicker, {
      width: '55%',
      height: '70%'
    });
  }
  openTemplateSaveOverlay() {
    this.popoverRef = this.popover.open(this.tplTemplateSave, {
      width: '55%',
      height: '70%'
    });
  }

  saveAsTemplate() {
    if (this.templateName && this.entries.length) {
      this.templates.push({
        name: this.templateName,
        sequence: this.entries
      });
      this.saveTemplates();
    }
  }

  setEntriesFromTemplate(template: SequenceListTemplate) {
    this.entries = template.sequence;
    this.popoverRef.close();
  }

  private saveTemplates() {
    this.savingTemplates = true;
    this.appCache.setItem(this.TEMPLATE_STORAGE_KEY, this.templates).subscribe(
      (res) => {
        this.savingTemplates = false;
        this.popoverRef.close();
      },
      (err) => (this.savingTemplates = false)
    );
  }

  private loadTemplates() {
    // TODO: Write to userservice
    // this.backend.get('users/settings').subscribe()
    this.appCache.getItem(this.TEMPLATE_STORAGE_KEY).subscribe((res) => (this.templates = res || []));
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    if (this.entryFormSubscription) this.entryFormSubscription.unsubscribe();
  }
}
