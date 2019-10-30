import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileDropService {
  private dropzones = [];
  private activeDropzone;
  private activeDropzoneSource = new ReplaySubject<string>();
  public activeDropzone$: Observable<string> = this.activeDropzoneSource.asObservable();

  constructor() {}

  add(id: string) {
    if (!this.dropzones.includes(id)) {
      this.dropzones.push(id);
    }
    console.log(this.dropzones);
    this.setActive(id);
  }
  remove(id) {
    this.dropzones = this.dropzones.filter(d => d !== id);
    console.log(this.dropzones);
    this.setActive(this.dropzones[this.dropzones.length - 1]);
  }

  clear() {
    this.dropzones = [];
    this.setActive(null);
  }

  private setActive(id) {
    this.activeDropzone = id;
    this.activeDropzoneSource.next(this.activeDropzone);
  }
}
