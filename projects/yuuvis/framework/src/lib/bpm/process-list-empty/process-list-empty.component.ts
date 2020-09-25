import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-process-list-empty',
  templateUrl: './process-list-empty.component.html',
  styleUrls: ['./process-list-empty.component.scss']
})
export class ProcessListEmptyComponent implements OnInit {
  @Input() state: string;
  @Input() message: string;
  @Output() refresh = new EventEmitter<boolean>();

  constructor() {}

  refreshList() {
    this.refresh.emit(true);
  }

  ngOnInit() {}
}
