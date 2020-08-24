import { CommonModule } from '@angular/common';
import { ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@yuuvis/core';
import { YuvCommonModule } from '../common/common.module';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvQuickfinderModule } from '../quickfinder/quickfinder.module';
import { YuvFormModule } from './../form/form.module';
import { ActionComponentAnchorDirective } from './action-menu/action-component-anchor/action-component-anchor.directive';
import { ActionMenuComponent } from './action-menu/action-menu.component';
import { ACTIONS, ActionService, CUSTOM_ACTIONS } from './action-service/action.service';
import { DeleteActionComponent } from './actions/delete-action/delete-action';
import { DeleteComponent } from './actions/delete-action/delete/delete.component';
import { DownloadActionComponent } from './actions/download-action/download-action';
import { DownloadOriginalActionComponent } from './actions/download-original-action/download-original-action';
import { DownloadPdfActionComponent } from './actions/download-pdf-action/download-pdf-action';
import { FollowUpActionComponent } from './actions/follow-up-action/follow-up-action';
import { FollowUpComponent } from './actions/follow-up-action/follow-up/follow-up.component';
import { MoveActionComponent } from './actions/move-action/move-action';
import { MoveComponent } from './actions/move-action/move/move.component';
import { UploadActionComponent } from './actions/upload-action/upload-action';
import { UploadComponent } from './actions/upload-action/upload/upload.component';

export const entryComponents = [
  DownloadActionComponent,
  DownloadOriginalActionComponent,
  DownloadPdfActionComponent,
  DeleteActionComponent,
  DeleteComponent,
  UploadComponent,
  UploadActionComponent,
  MoveActionComponent,
  MoveComponent,
  FollowUpActionComponent,
  FollowUpComponent
];

/**
 * `YuvActionModule` contains components for creating an actions menu.
 * Actions will be provided by the `ActionMenuComponent`. Part of the module
 * are actions that can be triggered for e.g. DmsObjects.
 */
@NgModule({
  imports: [
    CommonModule,
    YuvFormModule,
    YuvDirectivesModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    YuvComponentsModule,
    YuvCommonModule,
    YuvQuickfinderModule
  ],
  exports: [ActionMenuComponent],
  providers: [
    ActionService,
    {
      provide: ACTIONS,
      useValue: entryComponents,
      multi: true
    },
    {
      provide: CUSTOM_ACTIONS,
      useValue: []
    }
  ],
  declarations: [
    ActionMenuComponent,
    ActionComponentAnchorDirective,
    DownloadActionComponent,
    DownloadOriginalActionComponent,
    DownloadPdfActionComponent,
    DeleteActionComponent,
    DeleteComponent,
    UploadComponent,
    UploadActionComponent,
    MoveActionComponent,
    MoveComponent,
    FollowUpComponent,
    FollowUpActionComponent
  ],
  entryComponents
})
export class YuvActionModule {
  static forRoot(components: any[] = []): ModuleWithProviders<YuvActionModule> {
    return {
      ngModule: YuvActionModule,
      providers: [
        {
          provide: ANALYZE_FOR_ENTRY_COMPONENTS,
          useValue: components,
          multi: true
        },
        {
          provide: ACTIONS,
          useValue: entryComponents
        },
        {
          provide: CUSTOM_ACTIONS,
          useValue: components
        }
      ]
    };
  }
}
