import { Injectable } from '@angular/core';
import { Sort, SystemService, TranslateService, UserField, UserService, Utils } from '@yuuvis/core';
import { DisplayNamePipe, LocaleDatePipe } from '../../pipes';
import { Order } from './summeryOrder';

@Injectable({
  providedIn: 'root'
})
export class ObjectService {
  constructor(private translate: TranslateService, private systemService: SystemService, private userService: UserService) {}

  prepareData(data) {
    return (
      Object.keys(data)
        .map((key: string, index: number) => this.formatData({ key, value: data[key] }))
        // .filter(data => !!data.key)
        .map(field => {
          console.log(this.systemService.getObjectTypeProperty(field.key));
          return true;
        })
        .sort(Utils.sortValues('order', Sort.ASC))
        .sort(Utils.sortValues('baseparams', Sort.ASC))
    );
  }

  private formatData(data: any): any {
    let ref = { ...data };
    data.baseparams = !!this.systemService.getBaseTypeById(data.key);

    const orderEle = Order['email:email'].find(ele => ele.id === data.key);

    data.order = orderEle ? orderEle.order : 0;

    const valueArray = Array.isArray(data.value);
    const datePipe = new LocaleDatePipe(this.translate);
    const displayNamePipe = new DisplayNamePipe(this.userService);

    if (Object.values(UserField).includes(data.key)) {
      displayNamePipe.transform(data.value, 'Organization').subscribe(val => (data.value = val));
    }

    data.key = this.systemService.getLocalizedResource(`${data.key}_label`);
    data.key = !!data.key ? data.key : ref.key;
    // if (!!data.key) {
    //   return {};
    // }

    if (this.systemService.isDateFormat(data.value) && !valueArray) {
      data.value = datePipe.transform(data.value, 'eoShort');
    }

    data.chip = valueArray ? true : false;
    ref = null;
    return data;
  }

  generateListOrder(data, list) {
    return data.map(field => {
      if (field.id === list.id) {
        field.order = list.order;
      } else {
        field.order = 0;
      }
    });
  }
}
