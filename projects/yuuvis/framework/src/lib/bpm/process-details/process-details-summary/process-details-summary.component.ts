import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Process, TranslateService, UserService } from '@yuuvis/core';
import { takeUntilDestroy } from 'take-until-destroy';

@Component({
  selector: 'yuv-process-details-summary',
  templateUrl: './process-details-summary.component.html',
  styleUrls: ['./process-details-summary.component.scss']
})
export class ProcessDetailsSummaryComponent implements OnInit, OnDestroy {
  private processStates = {
    running: {
      label: this.translate.instant('yuv.framework.process-details-summary.status.running'),
      css: 'running'
    },
    completed: {
      label: this.translate.instant('yuv.framework.process-details-summary.status.completed'),
      css: 'completed'
    },
    suspended: {
      label: this.translate.instant('yuv.framework.process-details-summary.status.suspended'),
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
      } else if (p.completed) {
        this.processState = this.processStates.completed;
      } else {
        this.processState = this.processStates.running;
      }
    } else {
      this.processState = null;
    }
  }

  constructor(private translate: TranslateService, private userService: UserService) {
    this.userService.user$.pipe(takeUntilDestroy(this)).subscribe((_) => (this.isAdmin = this.userService.hasAdminRole));
  }

  deleteProcess() {
    // TODO: implement
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {}
}
