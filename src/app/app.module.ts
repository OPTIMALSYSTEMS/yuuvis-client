import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { YuvFrameworkModule } from '@yuuvis/framework';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './routing/app.routes.module';
import { DashboardComponent } from './states/dashboard/dashboard.component';
import { LoginComponent } from './states/login/login.component';
import { FrameComponent } from './components/frame/frame.component';
import { FormsModule } from '@angular/forms';
import { SettingsComponent } from './states/settings/settings.component';
import { ResultComponent } from './states/result/result.component';
import { NotFoundComponent } from './states/not-found/not-found.component';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    LoginComponent,
    FrameComponent,
    SettingsComponent,
    ResultComponent,
    NotFoundComponent],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    YuvFrameworkModule.forRoot({

      main: ['assets/default/config/main.json'],
      translations: ['assets/default/i18n/'],

      environment: environment
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
