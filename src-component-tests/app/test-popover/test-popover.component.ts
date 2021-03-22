import { Component } from '@angular/core';
import { PopoverService } from '@yuuvis/framework';

@Component({
  selector: 'yuv-test-popover',
  templateUrl: './test-popover.component.html',
  styleUrls: ['./test-popover.component.scss']
})
export class TestPopoverComponent {
  constructor(private popoverService: PopoverService) {}

  confirm() {
    this.popoverService
      .confirm({
        title: 'What do you thing',
        message: 'Earth is flat.',
        confirmLabel: 'Of course it is',
        cancelLabel: "Hmm, I don't think so"
      })
      .subscribe((res) => alert(`Result was '${res}'`));
  }

  acknowledge() {
    this.popoverService
      .confirm({
        title: 'Acknowledge',
        message: 'The sky is blue',
        confirmLabel: "Yes, that's right",
        hideCancelButton: true
      })
      .subscribe();
  }
}
