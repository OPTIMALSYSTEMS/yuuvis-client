import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DmsObject, DmsService, Process } from '@yuuvis/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'yuv-follow-up-details',
  templateUrl: './follow-up-details.component.html',
  styleUrls: ['./follow-up-details.component.scss']
})
export class FollowUpDetailsComponent implements OnInit {
  dmsObject: DmsObject;
  busy: boolean;
  notFound: boolean;
  error: string;
  private _process: Process;

  @Input() set process(p: Process) {
    this._process = p;
    this.notFound = false;
    this.dmsObject = null;

    if (p) {
      if (p.attachments?.length) {
        const id = p.attachments[0];
        this.busy = true;
        this.dmsService.getDmsObject(id).subscribe(
          (o: DmsObject) => {
            this.dmsObject = o;
            this.busy = false;
          },
          (err) => {
            this.busy = false;
            if (err.status === 404) {
              this.notFound = true;
            } else {
              this.error = err;
            }
          }
        );
      } else {
        // no attachment ?!?
        this.notFound = true;
      }
    }
  }
  @Input() layoutOptionsKey: string;
  @Input() plugins: Observable<any[]>;
  @Output() removeFollowUp = new EventEmitter<string>();

  constructor(private dmsService: DmsService) {}

  triggerRemoveFollowUp() {
    this.removeFollowUp.emit(this._process.id);
  }

  ngOnInit(): void {}
}
