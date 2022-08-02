import { DeliveryTimeService } from './services/delivery-time.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { SimpleGlobal } from 'ng2-simple-global';
import { MaterialModule } from './shared/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';

import { ConsultInternalCaseComponent } from './Modules/internalcases/consult/consult-internal-case.component';
import { ConsultInventoryComponent } from './Modules/inventory/consult/consult-inventory.component';
import { CrmutilService } from './services/crmutil.service';
import { httpInterceptorProviders } from './interceptors/index';
import { TraceabilityOtp } from './services/traceabilityOtp.service';
import { InternalCaseDetailComponent } from 'src/app/Modules/internalcases/detail/internal-case-detail.component';
import { CustomService } from './services/custom.service';
import { InformativeModalComponent } from './shared/informative-modal/informative-modal.component';
import { OptionspanelComponent } from './Modules/optionspanel/optionspanel.component';
import { ExternalService } from './services/external.service';
import { DomSanitizerPipe } from './shared/pipes/dom-sanitizer.pipe';
import { SafeResourceUrlPipe } from './shared/pipes/safe-resourceUrl.pipe';
import { DeviceDetailComponent } from 'src/app/Modules/inventory/detail/device-detail/device-detail.component';
import { ModalMicrositesComponent } from './shared/microsites-modal/microsites-modal.component';
import { WarrantyService } from './services/warranty.service';
import { DecisionTableModalComponent } from './shared/decision-table-modal/decision-table-modal.component';
import { ImeiToolsService } from './services/imeitools.service';
import { EndAttentionComponent } from './shared/end-attention/end-attention.component';
import { RunScriptsDirective } from './shared/directive/runscripts.directive';
import { SubscriptionsListComponent } from './Modules/subscriptionslist/subscriptionslist.component';
import { CreateOCCComponent } from './Modules/occ/create/create-occ.component';
import { ExternalRedirectFlowComponent } from './shared/external-redirect-flow/external-redirect-flow.component';
import { SendemailComponent } from './Modules/serviceorder/sendemail/sendemail.component';
import { KnowledgeBaseLibModule}  from 'knowledge-base-lib';
import { GenInvoiceComponent } from './Modules/internalcases/invoice/gen-invoice.component';
import { CashpaymentinvoiceComponent } from './shared/cashpaymentinvoice/cashpaymentinvoice.component';
import { ContainerdocumentsComponent } from './Modules/documentsmanager/containerdocuments/containerdocuments.component';
import { FileuploadComponent } from './Modules/documentsmanager/fileupload/fileupload.component';
import { BilledChargesModalComponent } from './shared/billed-charges-modal/billed-charges-modal.component';
import { ShoppingcartitemclsComponent } from './Modules/shoppingcart/shoppingcart.component';

@NgModule({
  declarations: [
    AppComponent,
    ConsultInternalCaseComponent,
    ConsultInventoryComponent,
    InternalCaseDetailComponent,
    InformativeModalComponent,
    OptionspanelComponent,
    DeviceDetailComponent,
    ModalMicrositesComponent,
    DomSanitizerPipe,
    SafeResourceUrlPipe,
    DecisionTableModalComponent,
    EndAttentionComponent,
    RunScriptsDirective,
    SubscriptionsListComponent,
    CreateOCCComponent,
    ExternalRedirectFlowComponent,
    SendemailComponent,
    GenInvoiceComponent,
    CashpaymentinvoiceComponent,
    ContainerdocumentsComponent,
    FileuploadComponent,
    BilledChargesModalComponent,
    ShoppingcartitemclsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AutocompleteLibModule,
    KnowledgeBaseLibModule
  ],
  exports: [

  ],
  providers: [
    CrmutilService,
    SimpleGlobal,
    NgxSpinnerService,
    httpInterceptorProviders,
    TraceabilityOtp,
    CustomService,
    ExternalService,
    DatePipe,
    DomSanitizerPipe,
    SafeResourceUrlPipe,
    WarrantyService,
    ImeiToolsService,
    DeliveryTimeService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }



