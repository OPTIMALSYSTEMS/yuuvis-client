import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

/**
 * `YuvCoreSharedModule` sets up and re-exports the TranslateModule.
 */
@NgModule({
  exports: [TranslateModule]
})
export class YuvCoreSharedModule {}
