import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { YuvCommonUiModule } from '@yuuvis/common-ui';
import { YuvFrameworkModule } from '@yuuvis/framework';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';
import { FrameComponent } from './components/frame/frame.component';
import { AppRoutingModule } from './routing/app.routes.module';
import { AboutModule } from './states/about/about.module';
import { DashboardComponent } from './states/dashboard/dashboard.component';
import { LoginComponent } from './states/login/login.component';
import { NotFoundComponent } from './states/not-found/not-found.component';
import { ResultComponent } from './states/result/result.component';
import { SettingsComponent } from './states/settings/settings.component';

@NgModule({
  declarations: [AppComponent, DashboardComponent, LoginComponent, ResultComponent, FrameComponent, SettingsComponent, NotFoundComponent],
  imports: [
    BrowserModule,
    FormsModule,
    YuvFrameworkModule.forRoot({
      main: ['assets/default/config/main.json'],
      translations: ['assets/default/i18n/'],
      environment
    }),
    AppRoutingModule,
    AboutModule,
    YuvCommonUiModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
