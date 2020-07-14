import { Component, OnInit } from '@angular/core';
import { DmsObject, SystemService } from '@yuuvis/core';

@Component({
  selector: 'yuv-test-action-menu',
  templateUrl: './test-action-menu.component.html',
  styleUrls: ['./test-action-menu.component.scss'],
  host: { class: 'yuv-test-container' }
})
export class TestActionMenuComponent implements OnInit {
  actionMenuVisible: boolean;
  actionMenuSelection;
  emptyActionMenuSelection = [];
  actionMenuSelectionWithContent = [this.getDmsObjectDummy()];

  constructor(private systemService: SystemService) {
    this.actionMenuSelection = this.emptyActionMenuSelection;
  }

  ngOnInit() {}

  toggleVisible(content: boolean = false) {
    this.actionMenuSelection = content ? this.actionMenuSelectionWithContent : this.emptyActionMenuSelection;
    this.actionMenuVisible = !this.actionMenuVisible;
  }

  getDmsObjectDummy() {
    return new DmsObject(
      {
        objectTypeId: 'appAsv:asvemail',
        fields: new Map<string, any>(),
        permissions: {
          read: ['metadata', 'content'],
          write: ['metadata', 'content'],
          delete: ['object', 'content']
        }
      },
      this.systemService.getObjectType('appAsv:asvemail')
    );
  }
}
