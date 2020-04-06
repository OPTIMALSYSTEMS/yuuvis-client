import { Component, Input, OnInit } from '@angular/core';
import { DmsObject } from '@yuuvis/core';

export interface ObjectCompareInput {
  first: {
    label: string;
    item: DmsObject;
  };
  second: {
    label: string;
    item: DmsObject;
  };
}

/**
 * Component comparing two dms objects.
 */
@Component({
  selector: 'yuv-object-details-compare',
  templateUrl: './object-details-compare.component.html',
  styleUrls: ['./object-details-compare.component.scss']
  // host: {class: 'yuv-object-details-compare'}
})
export class ObjectDetailsCompareComponent implements OnInit {
  /**
   * Objects to be compared
   */
  @Input() objectCompareInput: ObjectCompareInput;

  /**
   * Providing a layout options key will enable the component to persist its layout settings
   * in relation to a host component. The key is basically a unique key for the host, which
   * will be used to store component specific settings using the layout service.
   */
  @Input() layoutOptionsKey: string;

  constructor() {}

  ngOnInit() {}
}
