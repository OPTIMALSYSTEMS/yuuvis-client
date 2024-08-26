import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Process, ProcessService, ProcessVariable, TranslateService, UserService } from '@yuuvis/core';
import { IconRegistryService } from '../../../common/components/icon/service/iconRegistry.service';
import { PopoverService } from '../../../popover/popover.service';
import { deleteIcon } from '../../../svg.generated';

@Component({
  selector: 'yuv-process-details-summary',
  templateUrl: './process-details-summary.component.html',
  styleUrls: ['./process-details-summary.component.scss']
})
export class ProcessDetailsSummaryComponent implements OnInit, OnDestroy {
  private processStates = {
    running: {
      label: this.translate.instant('yuv.framework.process.status.running.label'),
      css: 'running'
    },
    completed: {
      label: this.translate.instant('yuv.framework.process.status.completed.label'),
      css: 'completed'
    },
    suspended: {
      label: this.translate.instant('yuv.framework.process.status.suspended.label'),
      css: 'suspended'
    }
  };
  processState: { label: string; css: string };
  isAdvancedUser: boolean;

  _process: Process;
  @Input() set process(p: Process) {
    this._process = p;
    this.resolveDisplayVariables();
    if (p) {
      if (p.suspended) {
        this.processState = this.processStates.suspended;
      } else if (!!p.endTime) {
        this.processState = this.processStates.completed;
      } else {
        this.processState = this.processStates.running;
      }
    } else {
      this.processState = null;
    }
  }
  // bpm variables that should be shown in the process summary
  private _displayVars: string[];
  @Input() set displayVars(dv: string[]) {
    this._displayVars = dv;
    this.resolveDisplayVariables();
  }
  _displayVarsResolved: ProcessVariable[] = [];

  constructor(
    private translate: TranslateService,
    private iconRegistry: IconRegistryService,
    private processService: ProcessService,
    private popoverService: PopoverService,
    private userService: UserService
  ) {
    this.iconRegistry.registerIcons([deleteIcon]);
    this.userService.user$.pipe(takeUntilDestroyed()).subscribe((_) => (this.isAdvancedUser = this.userService.isAdvancedUser));
  }

  private resolveDisplayVariables() {
    this._displayVarsResolved = this._process && this._displayVars ? this._process.variables.filter((v) => this._displayVars.includes(v.name)) : [];
  }

  deleteProcess() {
    this.popoverService
      .confirm({
        message: this.translate.instant('yuv.framework.process-details-summary.dialog.remove.message'),
        confirmLabel: this.translate.instant('yuv.framework.process-details-summary.action.delete')
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.processService.deleteProcess(this._process.id).subscribe();
        }
      });
  }

  valueAsString(value: any) {
    return Array.isArray(value) ? value.map((v) => JSON.stringify(v.title || v.id || v)).join(', ') : JSON.stringify(value);
  }

  ngOnInit(): void { }
  ngOnDestroy(): void { }
}
