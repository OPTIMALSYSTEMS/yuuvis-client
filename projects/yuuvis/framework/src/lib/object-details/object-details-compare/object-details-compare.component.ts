import { Component, Input, OnInit } from '@angular/core';
import { DmsObject, UserService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { IconRegistryService } from '../../common/components/icon/service/iconRegistry.service';
import { compare } from '../../svg.generated';
import { ObjectCompareInput } from './object-details-compare.interface';

/**
 * Component comparing two dms objects.
 *
 * [Screenshot](../assets/images/yuv-object-details-compare.gif)
 *
 * @example
 *   <yuv-object-details-compare [objectCompareInput]="compare" [layoutOptionsKey]="layoutOptionsKey + '.changes'"></yuv-object-details-compare>
 */
@Component({
  selector: 'yuv-object-details-compare',
  templateUrl: './object-details-compare.component.html',
  styleUrls: ['./object-details-compare.component.scss']
})
export class ObjectDetailsCompareComponent implements OnInit {
  userIsAdmin: boolean;

  @Input() activeVersion: DmsObject;

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

  @Input() plugins: Observable<any[]>;

  constructor(private userService: UserService, private iconRegistry: IconRegistryService) {
    this.iconRegistry.registerIcons([compare]);
    this.userIsAdmin = this.userService.hasAdministrationRoles;
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
