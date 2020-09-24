import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DmsObject, DmsService, TranslateService } from '@yuuvis/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'yuv-process-details',
  templateUrl: './process-details.component.html',
  styleUrls: ['./process-details.component.scss']
})
export class ProcessDetailsComponent implements OnInit {
  dmsObject$: Observable<DmsObject>;
  contextError: string = null;
  @Input() layoutOptionsKey: string;
  @Input() bpmObject: string;
  @Input()
  set objectId(id: string) {
    this.dmsObject$ = this.dmsServide.getDmsObject(id).pipe(
      catchError((error) => {
        this.contextError = this.translate.instant('yuv.client.state.object.context.load.error');
        return of(null);
      })
    );
  }

  @Output() remove = new EventEmitter<boolean>();

  constructor(private dmsServide: DmsService, private translate: TranslateService) {}

  ngOnInit() {}

  removeBpmObject() {
    this.remove.emit(true);
  }
}
