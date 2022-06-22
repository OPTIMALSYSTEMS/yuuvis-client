import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { YuvComponentRegister } from './../shared/utils/utils';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';

YuvComponentRegister.register([UserAvatarComponent]);

/**
 * Module provides a `UserAvatarComponent`.
 */
@NgModule({
  declarations: [UserAvatarComponent],
  imports: [CommonModule],
  exports: [UserAvatarComponent]
})
export class YuvUserModule {}
