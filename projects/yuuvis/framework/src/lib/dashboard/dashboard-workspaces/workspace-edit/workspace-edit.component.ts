import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Utils } from '@yuuvis/core';
import { WidgetGridUtils } from '@yuuvis/widget-grid';
import { DashboardWorkspace } from '../../dashboard.interface';

@Component({
  selector: 'yuv-workspace-edit',
  templateUrl: './workspace-edit.component.html',
  styleUrls: ['./workspace-edit.component.scss']
})
export class WorkspaceEditComponent implements OnInit {
  private _workspace: DashboardWorkspace;
  @Input() set workspace(ws: DashboardWorkspace) {
    this._workspace = ws;
    this.editForm.patchValue({
      label: ws ? ws.label : ''
    });
  }

  @Output() save = new EventEmitter<DashboardWorkspace>();
  @Output() cancel = new EventEmitter<any>();

  editForm: FormGroup = this.fb.group({
    label: ['', [Validators.required]]
  });

  constructor(private fb: FormBuilder) {}

  submit() {
    if (this._workspace?.id) {
      this._workspace.label = this.editForm.value.label;
    } else {
      this._workspace = {
        id: Utils.uuid(),
        label: this.editForm.value.label,
        grid: WidgetGridUtils.gridConfigStringify([])
      };
    }
    this.save.emit(this._workspace);
  }

  ngOnInit(): void {}
}
