import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

import { AuthInterceptor } from './interceptor/auth.interceptor';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthorizationComponent } from './pages/authorization/authorization.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GenerateFormComponent } from './pages/generate-form/generate-form.component';
import { ViewFormComponent } from './pages/view-form/view-form.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FormCardComponent } from './components/form-card/form-card.component';
import { OptionFieldComponent } from './components/option-field/option-field.component';
import { UserInfo } from './services/user-info.service';
import { ShowResponseComponent } from './pages/show-response/show-response.component';
import { RouteGuardService } from './services/route-guard.service';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { VerifyAccountComponent } from './pages/verify-account/verify-account.component';
import { MiddlerComponent } from './components/middler/middler.component';
import { AddEditorsComponent } from './components/add-editors/add-editors.component';
import { EditFormComponent } from './pages/edit-form/edit-form.component';
import { ChatComponent } from './components/chat/chat.component';
import { ResponseSheetComponent } from './pages/response-sheet/response-sheet.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthorizationComponent,
    DashboardComponent,
    GenerateFormComponent,
    ViewFormComponent,
    NavbarComponent,
    FormCardComponent,
    OptionFieldComponent,
    ShowResponseComponent,
    NotFoundComponent,
    VerifyAccountComponent,
    MiddlerComponent,
    AddEditorsComponent,
    EditFormComponent,
    ChatComponent,
    ResponseSheetComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  providers: [
    CookieService,
    UserInfo,
    RouteGuardService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
