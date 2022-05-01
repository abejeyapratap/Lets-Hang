import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { CreateComponent } from './create/create.component';
import { HomeComponent } from './home/home.component';
import { HangoutComponent } from './hangout/hangout.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { SummaryComponent } from './summary/summary.component';

@NgModule({
  declarations: [AppComponent, HomeComponent, CreateComponent, HangoutComponent, SummaryComponent],
  imports: [BrowserModule, AppRoutingModule, HttpClientModule, FormsModule, GoogleMapsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
