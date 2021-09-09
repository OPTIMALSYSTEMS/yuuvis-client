import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Process, ProcessService, TranslateService, UserService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';
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
  isAdmin: boolean;

  _process: Process;
  @Input() set process(p: Process) {
    this._process = p;
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

  constructor(
    private translate: TranslateService,
    private iconRegistry: IconRegistryService,
    private processService: ProcessService,
    private popoverService: PopoverService,
    private userService: UserService
  ) {
    this.iconRegistry.registerIcons([deleteIcon]);
    this.userService.user$.pipe(takeUntilDestroy(this)).subscribe((_) => (this.isAdmin = this.userService.hasAdminRole));
  }

  deleteProcess() {
    this.popoverService
      .confirm({
        message: this.translate.instant('yuv.framework.process-details-summary.dialog.remove.message')
      })
      .subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.processService.deleteProcess(this._process.id).subscribe();
        }
      });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
