import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';

/**
 * Module provides a `UserAvatarComponent`.
 */
@NgModule({
  declarations: [UserAvatarComponent],
  entryComponents: [UserAvatarComponent],
  imports: [CommonModule],
  exports: [UserAvatarComponent]
})
export class YuvUserModule {}
