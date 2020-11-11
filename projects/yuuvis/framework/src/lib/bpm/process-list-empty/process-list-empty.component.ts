import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { HeaderDetails } from '../interface/bpm.interface';
@Component({
  selector: 'app-process-list-empty',
  templateUrl: './process-list-empty.component.html',
  styleUrls: ['./process-list-empty.component.scss']
})
export class ProcessListEmptyComponent {
  @Input() state: string;
  @Input() message: string;
  @Input() headerDetails: HeaderDetails;
  @Output() refresh = new EventEmitter<boolean>();

  @Input() loading: Observable<boolean>;

  refreshList() {
    this.refresh.emit(true);
  }
}
