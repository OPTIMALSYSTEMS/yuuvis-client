import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { YuvFrameworkModule } from '@yuuvis/framework';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TestObjectFormComponent } from './test-object-form/test-object-form.component';

@NgModule({
  declarations: [AppComponent, TestObjectFormComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    YuvFrameworkModule.forRoot({
      main: ['assets/default/config/main.json'],
      translations: ['assets/default/i18n/'],
      environment
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
