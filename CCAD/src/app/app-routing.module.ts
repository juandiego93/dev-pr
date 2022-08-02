import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CertificadoCuentaComponent } from './components/certificado-cuenta/certificado-cuenta.component';


const routes: Routes = [
  { path: '', component: CertificadoCuentaComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
