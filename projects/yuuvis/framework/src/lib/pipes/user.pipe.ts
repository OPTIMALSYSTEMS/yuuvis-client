import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Pipe({
  name: 'DisplayName',
  pure: false
})
export class DisplayNamePipe implements PipeTransform {
  constructor(private userService: UserService) {}

  transform(value: string, key?: string): Observable<string> {
    let input = value;

    return this.userService
      .getUserById(value)
      .pipe(map(val => val.getDisplayNameName()));
  }
}

@Pipe({
  name: 'FullName',
  pure: false
})
export class FullNamePipe implements PipeTransform {
  constructor(private userService: UserService) {}

  transform(value: string, key?: string): any {
    let input = value;
    return this.userService
      .getUserById(value)
      .pipe(map(val => val.getFullName()));
  }
}
