import { ConsultInternalCaseComponent } from './Modules/internalcases/consult/consult-internal-case.component';
import { ConsultInventoryComponent } from './Modules/inventory/consult/consult-inventory.component';
import { ExternalRedirectFlowComponent } from './shared/external-redirect-flow/external-redirect-flow.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';


const routes: Routes = [
  { path: '', component: ConsultInternalCaseComponent },
  { path: 'query-caseinternal', component: ConsultInternalCaseComponent },
  { path: 'inventory', component: ConsultInventoryComponent },
  { path: 'externalRedirectFlow/:postData/:endPoint', component: ExternalRedirectFlowComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,{useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
