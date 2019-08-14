import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { YuvEvent } from './event.interface';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private eventSource = new Subject<YuvEvent>();
  public event$: Observable<any> = this.eventSource.asObservable();
  
  constructor() { }

    /**
   * Trigger an global event
   * @param type Type/key of the event
   * @param data Data to be send along with the event
   */
  trigger(type: string, data?: any) {
    this.eventSource.next({type, data});
  }

  /**
   * Listen on a triggered event
   * @param types Type/key of the event
   */
  on(...types: string[]): Observable<Event> {
    return this.event$
      .pipe(filter(event => event && !!types.find(t => t === event.type)));
  }
}
