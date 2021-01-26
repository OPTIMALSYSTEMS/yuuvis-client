import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { YuvCoreSharedModule } from '@yuuvis/core';
import { YuvPipesModule } from '../pipes/pipes.module';
import { YuvCommonModule } from './../common/common.module';
import { YuvDirectivesModule } from './../directives/directives.module';
import { YuvPopoverModule } from './../popover/popover.module';
import { PluginActionViewComponent } from './plugin-action-view.component';
import { PluginActionComponent } from './plugin-action.component';
import { PluginTriggerComponent } from './plugin-trigger.component';
import { PluginComponent } from './plugin.component';
import { PluginGuard } from './plugin.guard';
import { PluginsService } from './plugins.service';

@NgModule({
  imports: [CommonModule, YuvCoreSharedModule, YuvPipesModule, YuvCommonModule, RouterModule, YuvDirectivesModule, YuvPopoverModule],
  declarations: [PluginComponent, PluginActionComponent, PluginActionViewComponent, PluginTriggerComponent],
  exports: [PluginComponent, PluginActionComponent, PluginActionViewComponent, PluginTriggerComponent],
  entryComponents: [PluginComponent, PluginActionComponent, PluginActionViewComponent, PluginTriggerComponent],
  providers: [PluginsService, PluginGuard]
})
export class YuvPluginsModule {}
