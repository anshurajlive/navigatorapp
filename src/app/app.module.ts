import { BrowserModule } from '@angular/platform-browser';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppBootstrapModuleModule } from './app-bootstrap-module/app-bootstrap-module.module';
import { AgmCoreModule, GoogleMapsAPIWrapper } from '@agm/core';
import { AgmDirectionModule } from 'agm-direction';
import {DialogModule} from 'primeng/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {CardModule} from 'primeng/card';
import {ProgressBarModule} from 'primeng/progressbar';
import {ToastModule} from 'primeng/toast';
import { MessageService } from 'primeng/api';
import {StepsModule} from 'primeng/steps';
import {SidebarModule} from 'primeng/sidebar';
import {PanelMenuModule} from 'primeng/panelmenu';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AppBootstrapModuleModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBjt65f6TPXRfGjNW4EwbpTljYZLOqfgdM',
      libraries: ['places', 'geometry']
    }),
    AgmDirectionModule,
    DialogModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    ProgressBarModule,
    ToastModule,
    StepsModule,
    SidebarModule,
    PanelMenuModule
    
  ],
  providers: [MessageService, GoogleMapsAPIWrapper],
  bootstrap: [AppComponent],
  schemas:  [ CUSTOM_ELEMENTS_SCHEMA ]
})
export class AppModule { }
