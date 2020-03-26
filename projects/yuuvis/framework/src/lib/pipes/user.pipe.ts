import { Pipe, PipeTransform } from '@angular/core';
import { UserService } from '@yuuvis/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Transforms any user ID into the users display name.
 *
 * @example
 * <div *ngFor="let id of userIds | DisplayName">...</div>
 */
@Pipe({
  name: 'DisplayName',
  pure: false
})
export class DisplayNamePipe implements PipeTransform {
  constructor(private userService: UserService) {}

  transform(value: string, key?: string): Observable<string> {
    let input = value;

    return this.userService.getUserById(value).pipe(map(val => val.getDisplayNameName()));
  }
}

/**
 * Transforms any user ID into the users full name.
 *
 * @example
 * <div *ngFor="let id of userIds | FullName">...</div>
 */
@Pipe({
  name: 'FullName',
  pure: false
})
export class FullNamePipe implements PipeTransform {
  constructor(private userService: UserService) {}

  transform(value: string, key?: string): any {
    let input = value;
    return this.userService.getUserById(value).pipe(map(val => val.getFullName()));
  }
}
