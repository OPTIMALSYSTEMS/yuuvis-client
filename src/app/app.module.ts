import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { ServiceWorkerModule } from '@angular/service-worker';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { YuvComponentsModule, YuvDirectivesModule, YuvFrameworkModule } from '@yuuvis/framework';
import { AccordionModule } from 'primeng/accordion';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { FrameComponent } from './components/frame/frame.component';
import { AppRoutingModule } from './routing/app.routes.module';
import { AuthInterceptor } from './service/auth.interceptor';
import { AboutModule } from './states/about/about.module';
import { CreateComponent } from './states/create/create.component';
import { DashboardComponent } from './states/dashboard/dashboard.component';
import { NotFoundComponent } from './states/not-found/not-found.component';
import { ObjectComponent } from './states/object/object.component';
import { OfflineComponent } from './states/offline/offline.component';
import { ResultComponent } from './states/result/result.component';
import { SettingsComponent } from './states/settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    ResultComponent,
    FrameComponent,
    SettingsComponent,
    NotFoundComponent,
    ObjectComponent,
    CreateComponent,
    OfflineComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AccordionModule,
    YuvFrameworkModule.forRoot({
      main: ['assets/default/config/main.json'],
      translations: ['assets/default/i18n/'],
      environment
    }),
    AppRoutingModule,
    AboutModule,
    YuvComponentsModule,
    YuvCommonUiModule,
    YuvDirectivesModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}
