import { SimpleGlobal } from 'ng2-simple-global';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './shared/material.module';
import { CertificadoCuentaComponent } from './components/certificado-cuenta/certificado-cuenta.component';
import { CertificacionCuentaService } from './services/certicacion-cuenta.service';
import { TitleCasePipe, CommonModule } from '@angular/common';
import { CrmUtilService } from 'src/app/services/CrmUtil.service';
import { CertificadoCuentaModalComponent } from './components/certificado-cuenta/certificado-cuenta-modal.component';
import { NotificationService } from './services/notification.service';
import { DomSanitizerPipe } from './shared/pipes/dom-sanitizer.pipe';
import { SendEmailModalComponent } from './components/send-email-modal/send-email-modal.component';
import { WsImeiToolsService } from './services/wsimeitools.service';
import { SendResidenceModalComponent } from './components/send-residence-modal/send-residence-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinalizaratencionComponent } from './components/finalizar-atencion/finalizar-atencion.component';
import { httpInterceptorProviders } from './interceptors/';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CertificadoCuentaErrorModalComponent } from './components/certificado-cuenta/certificado-cuenta-error-modal.component';
import { ModalInformativoComponent } from './shared/components/modal-informativo/modal-informativo.component';
import { RunScriptsDirective } from './shared/directive/runscripts.directive';
import { DecisionTableModalComponent } from './shared/components/decision-table-modal/decision-table-modal.component';
import { KnowledgeBaseLibModule } from 'knowledge-base-lib';


@NgModule({
  declarations: [
    AppComponent,
    CertificadoCuentaComponent,
    CertificadoCuentaModalComponent,
    FinalizaratencionComponent,
    DomSanitizerPipe,
    SendEmailModalComponent,
    SendResidenceModalComponent,
    CertificadoCuentaErrorModalComponent,
    ModalInformativoComponent,
    RunScriptsDirective,
    DecisionTableModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    MaterialModule,
    KnowledgeBaseLibModule
  ],
  providers: [
    CertificacionCuentaService,
    TitleCasePipe,
    WsImeiToolsService,
    CrmUtilService,
    NotificationService,
    SimpleGlobal,
    DomSanitizerPipe,
    httpInterceptorProviders,
    { provide: MAT_DIALOG_DATA, useValue: [] },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
