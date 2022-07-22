import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { PendingChangesService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
import { PopoverRef } from '../../popover/popover.ref';
import { PopoverService } from '../../popover/popover.service';
import { SequenceItem } from '../sequence-list/sequence-list.interface';

@Component({
  selector: 'yuv-sequence-list-templates',
  templateUrl: './sequence-list-templates.component.html',
  styleUrls: ['./sequence-list-templates.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SequenceListTemplatesComponent),
      multi: true
    }
  ],
  host: {
    tabindex: '0'
  }
})
export class SequenceListTemplatesComponent implements OnDestroy, OnInit, ControlValueAccessor {
  @ViewChild('tplTemplateManager') tplTemplateManager: TemplateRef<any>;

  form: FormGroup = this.fb.group({
    sequence: [[]]
  });
  private _entries: SequenceItem[] = [];
  get entries() {
    return this._entries;
  }
  popoverRef: PopoverRef;

  @Input() templateStorageSection: string;
  @Output() itemEdit = new EventEmitter<boolean>();

  constructor(private fb: FormBuilder, private pendingChanges: PendingChangesService, private popover: PopoverService) {
    this.form.valueChanges.pipe(takeUntilDestroy(this)).subscribe((res) => {
      this.setEntries(res.sequence, false);
      this.propagate();
    });
  }
  propagateChange = (_: any) => {};

  private setEntries(e: SequenceItem[], patch: boolean) {
    this._entries = e;
    if (patch)
      this.form.patchValue({
        sequence: e || []
      });
  }

  private propagate() {
    this.propagateChange(this.entries);
  }

  writeValue(value: SequenceItem[]): void {
    this.setEntries(value || [], true);
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {}

  // TEMPLATES
  openTemplateManager() {
    this.popoverRef = this.popover.open(this.tplTemplateManager, {
      width: '55%',
      height: '70%'
    });
    this.popoverRef.preventClose = () => this.pendingChanges.check();
  }

  templateManagerCancel() {
    this.popoverRef.close();
  }

  templateManagerSelect(entries: SequenceItem[]) {
    this.setEntries(entries, true);
    this.popoverRef.close();
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
