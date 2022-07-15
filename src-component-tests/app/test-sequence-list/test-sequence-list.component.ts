import { Component, OnInit } from '@angular/core';
import { SequenceItem } from '@yuuvis/framework';

@Component({
  selector: 'app-test-sequence-list',
  templateUrl: './test-sequence-list.component.html',
  styleUrls: ['./test-sequence-list.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestSequenceListComponent implements OnInit {
  private preset: SequenceItem[] = [
    {
      title: 'task #1',
      nextAssignee: '1e11e50b-c261-40d7-b620-0e92d5b7140c',
      nextAssignee_title: 'S., Andel'
    },
    {
      title: 'task #2',
      nextAssignee: '1e11e50b-c261-40d7-b620-0e92d5b7140c',
      nextAssignee_title: 'S., Andel'
    },
    {
      title: 'task #3',
      nextAssignee: '892c4858-9a95-4d52-bd44-687a28c59274',
      nextAssignee_title: 'Zilla, Godzilla'
    }
  ];

  enableTemplates = false;
  sequenceList: SequenceItem[] = this.preset;
  sequenceListIsInEditMode: boolean;

  constructor() {}
  onModelChange() {
    console.log(this.sequenceList);
  }
  onItemEdit(isEditing: boolean) {
    this.sequenceListIsInEditMode = isEditing;
  }

  save() {}

  ngOnInit(): void {}
}
