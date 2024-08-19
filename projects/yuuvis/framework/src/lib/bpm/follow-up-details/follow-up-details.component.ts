import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DmsObject, DmsService, EventService, Process, YuvEventType } from '@yuuvis/core';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'yuv-follow-up-details',
  templateUrl: './follow-up-details.component.html',
  styleUrls: ['./follow-up-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowUpDetailsComponent implements OnInit {
  readonly #eventService = inject(EventService);
  readonly #dmsService = inject(DmsService);
  readonly #destroyRef = inject(DestroyRef);


  dmsObject = signal<DmsObject | null>(null);
  busy = signal<boolean>(false);
  notFound = signal<boolean>(false);
  error = signal<string | null>(null);
  #process: Process;

  @Input() set process(p: Process) {
    this.#process = p;
    this.notFound.set(false);
    this.dmsObject.set(null);

    if (p) {
      if (p.attachments?.length) {
        const id = p.attachments[0];
        this.busy.set(true);
        this.#dmsService.getDmsObject(id).subscribe({
          next: (o: DmsObject) => {
            this.dmsObject.set(o);
            this.busy.set(false);
          },
          error: (err) => {
            this.busy.set(false);
            if (err.status === 404) {
              this.notFound.set(true);
            } else {
              this.error = err;
            }
          }
        });
      } else {
        // no attachment ?!?
        this.notFound.set(true);
      }
    }
  }
  @Input() layoutOptionsKey: string;
  @Input() plugins: Observable<any[]>;
  removeFollowUp = output<string>();


  triggerRemoveFollowUp() {
    this.removeFollowUp.emit(this.#process.id);
  }

  ngOnInit(): void {
    this.#eventService
      .on(YuvEventType.DMS_OBJECT_DELETED)
      .pipe(
        tap(() => this.process = this.#process),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe();
  }
}
