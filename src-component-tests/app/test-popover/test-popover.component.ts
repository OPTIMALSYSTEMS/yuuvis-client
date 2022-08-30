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
        message:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',

        confirmLabel: 'Of course it is',
        cancelLabel: "Hmm, I don't think so"
      })
      .subscribe((res) => alert(`Result was '${res}'`));
  }

  confirmConfig() {
    this.popoverService
      .confirm({
        title: 'What do you thing',
        message:
          'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.',
        confirmLabel: 'Of course it is',
        cancelLabel: "Hmm, I don't think so",
        overlayConfig: { maxWidth: 300 }
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
