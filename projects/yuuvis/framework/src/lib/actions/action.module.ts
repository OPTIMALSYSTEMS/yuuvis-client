import { CommonModule } from '@angular/common';
import { ANALYZE_FOR_ENTRY_COMPONENTS, ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { TranslateModule } from '@yuuvis/core';
import { YuvComponentsModule } from '../components/components.module';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvFormModule } from './../form/form.module';
import { ActionComponentAnchorDirective } from './action-menu/action-component-anchor/action-component-anchor.directive';
import { ActionMenuComponent } from './action-menu/action-menu.component';
import { ACTIONS, ActionService, CUSTOM_ACTIONS } from './action-service/action.service';
import { DeleteActionComponent } from './actions/delete-action/delete-action';
import { DeleteComponent } from './actions/delete-action/delete/delete.component';
import { DownloadActionComponent } from './actions/download-action/download-action';
import { DownloadOriginalActionComponent } from './actions/download-original-action/download-original-action';
import { DownloadPdfActionComponent } from './actions/download-pdf-action/download-pdf-action';
import { OpenContextActionComponent } from './actions/open-context-action/open-context-action';
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
  OpenContextActionComponent
];

/**
 * @module
 * @description
 * Module for the action menu
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
    YuvCommonUiModule
  ],
  exports: [ActionMenuComponent],
  providers: [
    ActionService,
    {
      provide: ACTIONS,
      useValue: entryComponents
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
    OpenContextActionComponent
  ],
  entryComponents
})
export class ActionModule {
  static forRoot(components: any[] = []): ModuleWithProviders<ActionModule> {
    return {
      ngModule: ActionModule,
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
