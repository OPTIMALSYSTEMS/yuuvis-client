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
  @Input() emptyMessage: string;
  @Input()
  set objectId(id: string) {
    this.dmsObject$ = id
      ? this.dmsServide.getDmsObject(id).pipe(catchError((error) => this.handleObjectError(id)))
      : (this.dmsObject$ = this.handleObjectError(id));
  }

  @Output() remove = new EventEmitter<boolean>();

  constructor(private dmsServide: DmsService, private translate: TranslateService) {}

  private handleObjectError(id: string): Observable<null> {
    this.contextError = id ? this.translate.instant('yuv.client.state.object.context.load.error') : null;
    return of(null);
  }

  removeBpmObject() {
    this.remove.emit(true);
  }
}
