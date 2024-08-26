import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService, YuvUser } from '@yuuvis/core';
import { PopoverRef } from '../../../../popover/popover.ref';

@Component({
  selector: 'yuv-task-delegate-picker',
  templateUrl: './task-delegate-picker.component.html',
  styleUrls: ['./task-delegate-picker.component.scss']
})
export class TaskDelegatePickerComponent implements OnDestroy {
  assignee: string;
  user: YuvUser;

  @Input() popover: PopoverRef;
  @Output() assigneePicked = new EventEmitter<string>();

  constructor(private userService: UserService) {
    this.userService.user$.pipe(takeUntilDestroyed()).subscribe((u) => (this.user = u));
  }

  ngOnDestroy(): void { }
}
