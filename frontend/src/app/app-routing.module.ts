import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthorizationComponent } from './pages/authorization/authorization.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GenerateFormComponent } from './pages/generate-form/generate-form.component';
import { ViewFormComponent } from './pages/view-form/view-form.component';
import { ShowResponseComponent } from './pages/show-response/show-response.component';
import { RouteGuardService } from './services/route-guard.service';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { VerifyAccountComponent } from './pages/verify-account/verify-account.component';
import { MiddlerComponent } from './components/middler/middler.component';
import { EditFormComponent } from './pages/edit-form/edit-form.component';

const routes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'login', component: AuthorizationComponent, canActivate: [RouteGuardService]},
  {path: 'create', component: GenerateFormComponent, canActivate: [RouteGuardService]},
  {path: 'form/:formId', component: ViewFormComponent, canActivate: [RouteGuardService]},
  {path: 'form/edit/:formId', component: EditFormComponent, canActivate: [RouteGuardService]},
  {path: 'response/:responseId', component: ShowResponseComponent, canActivate: [RouteGuardService]},
  {path: 'verify/:slug', component: VerifyAccountComponent},
  {path: 'middler/:token', component: MiddlerComponent},
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
