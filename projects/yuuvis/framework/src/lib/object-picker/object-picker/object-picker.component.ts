import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { BaseObjectTypeField, ClientDefaultsObjectTypeField, SearchQuery, SearchResult, SearchService } from '@yuuvis/core';

@Component({
  selector: 'yuv-object-picker',
  templateUrl: './object-picker.component.html',
  styleUrls: ['./object-picker.component.scss']
})
export class ObjectPickerComponent implements OnInit {
  total: number;
  searchResult: {
    id: string;
    objectTypeId: string;
    title: string;
    description: string;
  }[] = [];

  constructor(private searchService: SearchService) {}

  @Output() select = new EventEmitter();

  onQuickSearchQueryChange(q: SearchQuery) {
    q.fields = [
      BaseObjectTypeField.OBJECT_ID,
      BaseObjectTypeField.OBJECT_TYPE_ID,
      ClientDefaultsObjectTypeField.TITLE,
      ClientDefaultsObjectTypeField.DESCRIPTION
    ];
    q.size = 10;
    this.searchService.search(q).subscribe(
      (res: SearchResult) => {
        this.total = res.totalNumItems;
        this.searchResult = res.items.map((i) => ({
          id: i.fields.get(BaseObjectTypeField.OBJECT_ID),
          objectTypeId: i.fields.get(BaseObjectTypeField.OBJECT_TYPE_ID),
          title: i.fields.get(ClientDefaultsObjectTypeField.TITLE),
          description: i.fields.get(ClientDefaultsObjectTypeField.DESCRIPTION)
        }));
      },
      (err) => {
        console.error(err);
      }
    );
  }

  onQuickSearchQuery(q: SearchQuery) {
    console.log(q);
  }

  onQuickSearchReset() {
    console.log('reset');
  }

  ngOnInit(): void {}
}
