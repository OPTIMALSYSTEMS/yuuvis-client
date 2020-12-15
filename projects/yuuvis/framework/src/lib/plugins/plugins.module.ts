import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { YuvCoreSharedModule } from '@yuuvis/core';
import { YuvDirectivesModule } from '../directives/directives.module';
import { YuvPipesModule } from '../pipes/pipes.module';
import { PluginActionViewComponent } from './plugin-action-view.component';
import { PluginActionComponent } from './plugin-action.component';
import { PluginComponent } from './plugin.component';
import { PluginGuard } from './plugin.guard';
import { PluginsService } from './plugins.service';

@NgModule({
  imports: [CommonModule, YuvCoreSharedModule, YuvPipesModule, YuvDirectivesModule, RouterModule],
  declarations: [PluginComponent, PluginActionComponent, PluginActionViewComponent],
  exports: [PluginComponent, PluginActionComponent, PluginActionViewComponent],
  entryComponents: [PluginComponent, PluginActionComponent, PluginActionViewComponent],
  providers: [PluginsService, PluginGuard]
})
export class YuvPluginsModule {}
