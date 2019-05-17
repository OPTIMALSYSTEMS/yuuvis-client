import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// Service to share data between the result state components

@Injectable()
export class ResultStateService {

    private items: any[] = [];
    private selectedItem;
    private selectedItemSource = new BehaviorSubject<any>(null);
    selectedItem$ = this.selectedItemSource.asObservable();

    setResult(items: any[]) {
        this.items = items;
    }

    select(id: string) {
        this.selectedItem = this.items.find(i => i.id === id);
        this.selectedItemSource.next(this.selectedItem);
    }

    getSelectedItem() {
        return this.selectedItem;
    }
}