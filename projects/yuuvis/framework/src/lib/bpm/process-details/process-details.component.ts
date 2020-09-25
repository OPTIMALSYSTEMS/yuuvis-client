import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DmsObject, DmsService, TranslateService } from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'yuv-process-details',
  templateUrl: './process-details.component.html',
  styleUrls: ['./process-details.component.scss']
})
export class ProcessDetailsComponent {
  dmsObject$: Observable<DmsObject> = of(null);
  contextError: string = null;
  loaded = false;
  @Input() layoutOptionsKey: string;
  @Input() bpmObject: string;
  @Input()
  set objectId(id: string) {
    if (id) {
      this.dmsObject$ = this.dmsServide.getDmsObject(id).pipe(
        catchError((error) => {
          this.contextError = this.translate.instant('yuv.client.state.object.context.load.error');
          return of(null);
        })
      );
    }
  }

  @Output() remove = new EventEmitter<boolean>();

  constructor(private dmsServide: DmsService, private translate: TranslateService) {}

  removeBpmObject() {
    this.remove.emit(true);
  }
}
