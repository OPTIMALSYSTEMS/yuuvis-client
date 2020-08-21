import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SearchQuery, SystemType } from '@yuuvis/core';
import { PopoverConfig, PopoverRef, PopoverService, QuickSearchPickerData, QuickSearchService, Selectable, SelectableGroup } from '@yuuvis/framework';

@Component({
  selector: 'yuv-filter-configuration',
  templateUrl: './filter-configuration.component.html',
  styleUrls: ['./filter-configuration.component.scss']
})
export class FilterConfigurationComponent implements OnInit {
  @ViewChild('tplValuePicker') tplValuePicker: TemplateRef<any>;
  @ViewChild('typeSelectTrigger') typeSelectTrigger: ElementRef;

  objectTypeSelectLabel: string;
  availableObjectTypeGroups: SelectableGroup[] = [];
  availableObjectTypes: Selectable[] = [];

  data: any = {
    query: new SearchQuery(),
    typeSelection: [SystemType.DOCUMENT],
    sharedFields: true
  };

  get types() {
    return this.data.typeSelection.map((id) => this.availableObjectTypes.find((t) => t.id === id).label).join(', ');
  }

  constructor(private popoverService: PopoverService, private quickSearchService: QuickSearchService) {
    this.availableObjectTypeGroups = this.quickSearchService.availableObjectTypeGroups;
    this.availableObjectTypes = this.quickSearchService.availableObjectTypes;
  }

  showObjectTypePicker() {
    const pickerData: QuickSearchPickerData = {
      type: 'type',
      items: this.availableObjectTypeGroups,
      selected: this.data.typeSelection
    };
    const popoverConfig: PopoverConfig = {
      width: '55%',
      height: '70%',
      disableSmallScreenClose: true,
      data: pickerData
    };
    this.popoverService.open(this.tplValuePicker, popoverConfig);
  }

  onPickerResult(type: any, res: Selectable[], popoverRef?: PopoverRef) {
    this.data = { ...this.data, typeSelection: res.map((t) => t.id) };
    this.onPickerCancel(popoverRef);
  }

  onPickerCancel(popoverRef?: PopoverRef) {
    return popoverRef && popoverRef.close();
  }

  ngOnInit(): void {}
}
