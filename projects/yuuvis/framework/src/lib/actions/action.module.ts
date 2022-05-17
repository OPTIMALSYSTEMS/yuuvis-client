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
import { YuvPluginsModule } from './../plugins/plugins.module';
import { ActionMenuComponent } from './action-menu/action-menu.component';
import { ACTIONS, ActionService, CUSTOM_ACTIONS } from './action-service/action.service';
import { DeleteActionComponent } from './actions/delete-action/delete-action';
import { DeleteComponent } from './actions/delete-action/delete/delete.component';
import { DownloadActionComponent } from './actions/download-action/download-action';
import { FollowUpActionComponent } from './actions/follow-up-action/follow-up-action';
import { FollowUpComponent } from './actions/follow-up-action/follow-up/follow-up.component';
import { MoveActionComponent } from './actions/move-action/move-action';
import { MoveComponent } from './actions/move-action/move/move.component';
import { ReferenceActionComponent } from './actions/reference-action/reference-action';
import { RetentionProlongActionComponent } from './actions/retention/retention-prolong.action';
import { RetentionProlongComponent } from './actions/retention/retention-prolong/retention-prolong.component';
import { RetentionStartComponent } from './actions/retention/retention-start/retention-start.component';
import { RetentionActionComponent } from './actions/retention/retention.action';
import { UploadActionComponent } from './actions/upload-action/upload-action';
import { UploadComponent } from './actions/upload-action/upload/upload.component';

export const entryComponents = [
  DownloadActionComponent,
  DeleteActionComponent,
  DeleteComponent,
  UploadComponent,
  UploadActionComponent,
  MoveActionComponent,
  MoveComponent,
  FollowUpActionComponent,
  FollowUpComponent,
  ReferenceActionComponent,
  RetentionActionComponent,
  RetentionStartComponent,
  RetentionProlongActionComponent,
  RetentionProlongComponent
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
    YuvQuickfinderModule,
    YuvPluginsModule
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
  declarations: [ActionMenuComponent, ...entryComponents],
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
