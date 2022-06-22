import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { CommandPaletteComponent, CommandPaletteModule } from '@yuuvis/command-palette';
import { YuvColumnConfigModule, YuvCommonModule, YuvComponentRegister, YuvComponentsModule, YuvDirectivesModule, YuvFrameworkModule } from '@yuuvis/framework';
import { AccordionModule } from 'primeng/accordion';
import { environment } from '../environments/environment';
import { ActionsModule } from './actions/actions.module';
import { AppComponent } from './app.component';
import { FrameComponent } from './components/frame/frame.component';
import { AppRoutingModule } from './routing/app.routes.module';
import { AuthInterceptor } from './service/auth.interceptor';
import { AboutModule } from './states/about/about.module';
import { ColumnConfigurationComponent } from './states/column-configuration/column-configuration.component';
import { CreateComponent } from './states/create/create.component';
import { DashboardComponent } from './states/dashboard/dashboard.component';
import { FilterConfigurationComponent } from './states/filter-configuration/filter-configuration.component';
import { FollowUpsComponent } from './states/follow-ups/follow-ups.component';
import { InboxComponent } from './states/inbox/inbox.component';
import { NotFoundComponent } from './states/not-found/not-found.component';
import { ObjectComponent } from './states/object/object.component';
import { OfflineComponent } from './states/offline/offline.component';
import { ProcessesComponent } from './states/processes/processes.component';
import { ResultComponent } from './states/result/result.component';
import { RetentionsComponent } from './states/retentions/retentions.component';
import { SettingsComponent } from './states/settings/settings.component';
import { VersionsComponent } from './states/versions/versions.component';

const components = [
  AppComponent,
  DashboardComponent,
  ResultComponent,
  FrameComponent,
  SettingsComponent,
  NotFoundComponent,
  ObjectComponent,
  CreateComponent,
  OfflineComponent,
  VersionsComponent,
  ColumnConfigurationComponent,
  InboxComponent,
  FilterConfigurationComponent,
  ProcessesComponent,
  FollowUpsComponent,
  RetentionsComponent
];

YuvComponentRegister.register(components);
YuvComponentRegister.register([CommandPaletteComponent]);

@NgModule({
  declarations: [...components],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AccordionModule,
    CommandPaletteModule.forRoot({
      searchModeIndicator: '?'
    }),
    YuvFrameworkModule.forRoot(
      {
        main: ['assets/default/config/main.json'],
        translations: ['assets/default/i18n/'],
        environment
      },
      {
        object: {
          path: 'object',
          params: {
            id: 'id'
          },
          queryParams: {
            query: 'query'
          }
        },
        versions: {
          path: 'versions',
          params: {
            id: 'id'
          },
          queryParams: {
            version: 'version'
          }
        },
        result: {
          path: 'result',
          queryParams: {
            query: 'query'
          }
        }
      }
    ),
    AppRoutingModule,
    AboutModule,
    ActionsModule,
    YuvComponentsModule,
    YuvCommonModule,
    YuvColumnConfigModule,
    YuvDirectivesModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}
