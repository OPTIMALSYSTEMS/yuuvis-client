import { Component, Input, OnInit } from '@angular/core';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { compare } from '../../svg.generated';
import { ObjectCompareInput } from './object-details-compare.interface';

/**
 * Component comparing two dms objects.
 */
@Component({
  selector: 'yuv-object-details-compare',
  templateUrl: './object-details-compare.component.html',
  styleUrls: ['./object-details-compare.component.scss']
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

  constructor(private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([compare]);
  }

  toggle() {
    this.objectCompareInput = {
      first: this.objectCompareInput.second,
      second: this.objectCompareInput.first,
      title: this.objectCompareInput.title
    };
  }

  ngOnInit() {}
}
