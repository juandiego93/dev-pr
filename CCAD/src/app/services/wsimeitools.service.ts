import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestAdminCharges } from 'src/app/models/requests-models/request-admincharges';
import { ResponseAdminCharges } from 'src/app/models/response-model/response-admincharges';
import { RequestChargesNotification } from 'src/app/models/requests-models/request-chargesnotification';
import { ResponseChargesNotification } from 'src/app/models/response-model/response-chargesnotification';
import { ResponseLuhn } from 'src/app/models/response-model/responseluhn';
import { RequestGetTreeRestructuring } from 'src/app/models/requests-models/requestgettreerestructuring';
import { ResponseGetTreeRestructuring } from 'src/app/models/response-model/responsegettreerestructuring';
import { environment } from 'src/environments/environment';
import { RequestCustomerValid } from '../models/requests-models/RequestCustomerValid';
import { ResponseCustomerValid } from '../models/response-model/ResponseCustomerValid';
import { RequestBillingPayments } from '../models/requests-models/RequestBillingPayments';
import { ResponseBillingPayments } from '../models/response-model/ResponseBillingPayments';
import { ResponseCuentaDiaMovil } from '../models/response-model/ResponseCuentaDiaMovil';
import { RequestCuentaDiaMovil } from '../models/requests-models/RequestCuentaDiaMovil';
import { RequestFinancingsSearch } from '../models/requests-models/RequestFinancingsSearch';
import { RequestFinancingIntegrator } from './../models/requests-models/request-financing';
import { ResponseFinancingIntegrator } from '../models/response-model/response-financing';
import { RequestConsultarCuentas } from '../models/requests-models/RequestConsultarCuentas';
import { RequestFinanciacionUnificada } from '../models/requests-models/RequestFinanciacionUnificada';
import { SimpleGlobal } from 'ng2-simple-global';
import { CommonParameterClassServices } from './commonparameterclassservices.service';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
};


@Injectable({
  providedIn: 'root'
})


export class WsImeiToolsService {

  constructor(private httpClient: HttpClient,
              private sg: SimpleGlobal,
              private common: CommonParameterClassServices) { }

  private readonly serviceConsultarCuentas = 'GetConsultarCuentas';
  private readonly urlServiceOperActClcc = 'GetCLCCTAAR0P';
  private readonly ctaDiaMovil = 'GetMobileDayAccount';
  private readonly servFinanciacionUnif = 'FinanciacionUnificada';
  private readonly controllerChargesNot = 'chargesnotification';
  private readonly controllerAdminCha = 'admincharges';
  private readonly billingPayments = 'getBillingPayments';
  private readonly financingIntegrator = 'consultafinanciaciondetallada';
  private readonly financingsSearch = 'financingssearch';
  private readonly controllerGetInfoCl = 'getInfoClient';
  private readonly consultaCim = 'consultaCim';
  private readonly routeFileB64 = 'SaveFileBase64';
  private readonly controllerDynamicDoc = 'getTemplateDocuments';

  chargesnotification(data: RequestChargesNotification): Observable<ResponseChargesNotification> {
    return this.httpClient.get<ResponseLuhn>(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
           this.controllerChargesNot, JSON.stringify(data), 'Get', environment.header, environment.busV));
  }

  getBillingPayments(request: RequestBillingPayments): Observable<ResponseBillingPayments> {
    return this.httpClient.get<ResponseLuhn>(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
           this.billingPayments, JSON.stringify(request), 'Get', environment.header, environment.busV));
  }

  adminCharges(data: RequestAdminCharges): Observable<ResponseAdminCharges> {
    return this.httpClient.get<ResponseLuhn>(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
           this.controllerAdminCha, JSON.stringify(data), 'Get', environment.header, environment.busV));
  }

  getInfoCliente(apellido: string, tipDoc: string, numDocumento: string): Observable<ResponseLuhn> {
    return this.httpClient.get<ResponseLuhn>(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
           this.controllerGetInfoCl, '{"documentNumber":"' + numDocumento + '","documentType":"' + tipDoc + '","firstSurname":"' + apellido + '"}',
           'Get', environment.header, environment.busV));
  }

  postCuentaAlDiaMovil(request: RequestCuentaDiaMovil): Observable<ResponseCuentaDiaMovil> {
    return this.httpClient.post<any>(
      this.common.StringFormat(this.sg['Servicios'].WsPostSaleGeneral, this.ctaDiaMovil,
           JSON.stringify(request), 'Post', environment.header, environment.busV), JSON.stringify(request),
           { headers: { 'Content-Type': 'application/json' } });
  }

  GetFinancingsSearch(request: RequestFinancingsSearch): Observable<ResponseLuhn> {
    return this.httpClient.get<ResponseLuhn>(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
      this.financingsSearch, JSON.stringify(request), 'Get', environment.header, environment.busV));
  }

  getConsultaFinanciacionD(request: RequestFinancingIntegrator): Observable<ResponseFinancingIntegrator> {
    return this.httpClient.get<ResponseLuhn>(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
      this.financingIntegrator, JSON.stringify(request), 'Get', environment.header, environment.busV));
  }

  PostSearchAccounts(request: RequestConsultarCuentas): Observable<ResponseLuhn> {
    return this.httpClient.post<any>(
      this.common.StringFormat(this.sg['Servicios'].WsPostSale, this.serviceConsultarCuentas,
           JSON.stringify(request), 'Post', environment.header, environment.busV), JSON.stringify(request),
           { headers: { 'Content-Type': 'application/json' } });
  }

  GetJoinFinancial(request: RequestFinanciacionUnificada): Observable<ResponseLuhn> {
    return this.httpClient.post<any>(
      this.common.StringFormat(this.sg['Servicios'].WsPostSale, this.servFinanciacionUnif,
           JSON.stringify(request), 'Post', environment.header, environment.busV), JSON.stringify(request),
           { headers: { 'Content-Type': 'application/json' } });
  }

  queryCim(tipDoc: string, numDocumento: string): Observable<ResponseLuhn> {
    return this.httpClient.get<ResponseLuhn>(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
        this.consultaCim, '{"documentNumber":"' + numDocumento + '","documentType":"' + tipDoc + '"}',
        'Get', environment.header, environment.busV));
  }
  PostSaveFile(request: any): Observable<ResponseLuhn>{
    return this.httpClient.post<ResponseLuhn>(
      this.common.StringFormat(this.sg['Servicios'].WsPostSaleGeneral, this.routeFileB64,
      JSON.stringify(request), 'Post', environment.header, environment.busV), JSON.stringify(request),
      { headers: { 'Content-Type': 'application/json' } });
  }

  /** Método que obtiene la plantilla que coincide con el Id enviado por parámetro. */
  getTemplateById(requestObj): Observable<any> {
    return this.httpClient.get(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,this.controllerDynamicDoc, JSON.stringify(requestObj),'Get', environment.header));
  }

}
