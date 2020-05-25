import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseObjectTypeField, SearchQuery, SearchService, SecondaryObjectTypeField, SystemService, SystemType } from '@yuuvis/core';
import { debounceTime, map } from 'rxjs/operators';

/**
 * Component that providees a picker to search and select a context folder.
 */
@Component({
  selector: 'yuv-context-picker',
  templateUrl: './context-picker.component.html',
  styleUrls: ['./context-picker.component.scss']
})
export class ContextPickerComponent implements OnInit {
  private query: SearchQuery;
  inputForm: FormGroup;
  result: {
    id: string;
    iconSVG: string;
    title: string;
    description: string;
  }[];

  /**
   * Emitted once a context has been selected
   */
  @Output() contextSelect = new EventEmitter<string>();
  /**
   * Emitted when the user aborts picking a context
   */
  @Output() cancel = new EventEmitter<any>();

  constructor(private fb: FormBuilder, private systemService: SystemService, private searchService: SearchService) {
    this.query = new SearchQuery({
      fields: [BaseObjectTypeField.OBJECT_ID, BaseObjectTypeField.OBJECT_TYPE_ID, SecondaryObjectTypeField.TITLE, SecondaryObjectTypeField.DESCRIPTION],
      types: [SystemType.FOLDER]
    });

    this.inputForm = this.fb.group({
      term: []
    });
    this.inputForm.valueChanges.pipe(debounceTime(800)).subscribe((formValue) => {
      console.log(formValue.term);

      this.query.term = `*${formValue.term}*`;
      this.fetchResult();
    });
  }

  private fetchResult() {
    this.searchService
      .search(this.query)
      .pipe(
        map((r) =>
          r.items.map((i) => ({
            id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
            iconSVG: this.systemService.getObjectTypeIcon(BaseObjectTypeField.OBJECT_TYPE_ID),
            title: i.fields.get(SecondaryObjectTypeField.TITLE),
            description: i.fields.get(SecondaryObjectTypeField.DESCRIPTION)
          }))
        )
      )
      .subscribe(
        (r) => (this.result = r),
        (e) => console.error(e)
      );
  }

  ngOnInit(): void {}
}
