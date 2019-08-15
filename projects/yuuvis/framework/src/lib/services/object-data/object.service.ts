import { Injectable } from '@angular/core';
import {
  SystemService,
  TranslateService,
  UserField,
  UserService
} from '@yuuvis/core';
import { DisplayNamePipe, LocaleDatePipe } from '../../pipes';

@Injectable({
  providedIn: 'root'
})
export class ObjectService {
  constructor(
    private translate: TranslateService,
    private systemService: SystemService,
    private userService: UserService
  ) {}

  formatData(data: any): any {
    data.baseparams = this.systemService.getBaseTypeById(data.key)
      ? true
      : false;

    const datePipe = new LocaleDatePipe(this.translate);
    const displayNamePipe = new DisplayNamePipe(this.userService);

    if (Object.values(UserField).includes(data.key)) {
      displayNamePipe
        .transform(data.value, 'Organization')
        .subscribe(val => (data.value = val));
    }

    data.key = this.systemService.getLocalizedResource(`${data.key}_label`);

    // this.systemService.getBaseTypePropertyTypeById(data.key) === 'daytime'
    if (this.systemService.isDateFormat(data.value)) {
      data.value = datePipe.transform(data.value, 'eoShort');
    }

    data.chip = Array.isArray(data.value) ? true : false;
    return data;
  }
}
