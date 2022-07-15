import { Component, OnInit } from '@angular/core';
import { SequenceItem } from '@yuuvis/framework';

@Component({
  selector: 'app-test-sequence-list',
  templateUrl: './test-sequence-list.component.html',
  styleUrls: ['./test-sequence-list.component.scss']
})
export class TestSequenceListComponent implements OnInit {
  sequenceList: SequenceItem[] = [];

  constructor() {}

  ngOnInit(): void {}
}
