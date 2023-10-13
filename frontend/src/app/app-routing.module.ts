import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthorizationComponent } from './pages/authorization/authorization.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GenerateFormComponent } from './pages/generate-form/generate-form.component';
import { ViewFormComponent } from './pages/view-form/view-form.component';
import { ShowResponseComponent } from './pages/show-response/show-response.component';

const routes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'login', component: AuthorizationComponent},
  {path: 'create', component: GenerateFormComponent},
  {path: 'form/:formId', component: ViewFormComponent},
  {path: 'response/:responseId', component: ShowResponseComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
