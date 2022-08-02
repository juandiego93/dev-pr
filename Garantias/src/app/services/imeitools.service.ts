import { InsertDdocNameRequest, InsertDdocNameResponse } from './../models/ddocname';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Util } from '../shared/util';
import { RequestTraceabilityOtp } from '../models/traceabilityOtp';
import { TypeDocument } from './../models/documentType';
import { CstPaymentResponse, CstVerifyPaymentRequest, GenericResponse } from './../models/generic';
import { TraceabilityOtp } from './traceabilityOtp.service';
import { CustomService } from './custom.service';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
};


@Injectable({
  providedIn: 'root'
})

export class ImeiToolsService {

  private listIdDocumentType: TypeDocument[];
  private readonly routeFileB64 = 'SaveFileBase64';
  private readonly routeCitiesDepartments = 'Cities_Departaments';
  private readonly cstPayment ='PostSaleInspCSTPayment';
  private traceability = { error: false } as RequestTraceabilityOtp;
  private readonly controllerCustomerByMin  = 'QueryDataMin';
  private readonly controlerInvoice = 'GetInvoice';


  constructor(private httpClient: HttpClient,
    private util: Util,
    private custom: CustomService,
    private traceabilityWs: TraceabilityOtp) { }

  public GetListTypeDocument() {
    return this.listIdDocumentType;
  }
  public GetDocumentsList(): Promise<any> {
    return new Promise((resolve, reject) => {
      let response: GenericResponse;
      const parameters = this.custom.GetParametersGroup();
      this.httpClient.get<GenericResponse>(
        this.util.StringFormat(parameters.URLServicios.WsImeiTools,
          'typedocument', '""',
          'Get', environment.header)).subscribe(
            data => response = data,
            () => {
              this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'GetTypeDocument - typedocument', valueTraza: response });
              this.custom.AddCountError();
            },
            () => {
              this.custom.DelCountError();
              if (!response.isValid) {
                this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'GetTypeDocument - typedocument', valueTraza: response });
                this.util.OpenAlert('No fue posible consultar tipos de documento: ' + response.message, false);
              } else {
                this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetTypeDocument - typedocument', valueTraza: response });
                this.listIdDocumentType = JSON.parse(response.message);
                this.listIdDocumentType.find(cd => cd.Description.trim() === '').Description = 'Seleccione...';
                resolve(this.listIdDocumentType);
              }
            }
          );
    });
  }

  public GetTypeDocument(): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetTypeDocument - typedocument', dataTraza: '' });
    const parameters = this.custom.GetParametersGroup();
    this.httpClient.get<GenericResponse>(
      this.util.StringFormat(parameters.URLServicios.WsImeiTools,
        'typedocument', '""',
        'Get', environment.header)).subscribe(
          (response: GenericResponse) => {
            this.custom.DelCountError();
            if (!response.isValid) {
              this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'GetTypeDocument - typedocument', valueTraza: response });
              this.util.OpenAlert('No fue posible consultar tipos de documento: ' + response.message, false);
            } else {
              this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetTypeDocument - typedocument', valueTraza: response });
              this.listIdDocumentType = JSON.parse(response.message);
              this.listIdDocumentType.find(cd => cd.Description.trim() === '').Description = 'Seleccione...';
            }
          },error => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'GetTypeDocument - typedocument', valueTraza: error.message });
            this.custom.AddCountError();
              if(this.custom.GetCountError() <= environment.ic) {
                this.GetTypeDocument();
              }
          }
        );
  }
  public PostSaveFile(request: any): Observable<GenericResponse>{
    const parameters = this.custom.GetParametersGroup();

    return this.httpClient.post<GenericResponse>(
      this.util.StringFormat(parameters.URLServicios.WsPostSaleGeneral, this.routeFileB64,
      JSON.stringify(request), 'Post', environment.header), JSON.stringify(request),
      { headers: { 'Content-Type': 'application/json' } });
  }
  public getCitiesDepartment(): Observable<GenericResponse> {
    const parameters = this.custom.GetParametersGroup();
    return this.httpClient.get<GenericResponse>(
      this.util.StringFormat(parameters.URLServicios.WsImeiTools,
        this.routeCitiesDepartments, '""',
        'Get', environment.header));
  }

  public consultaCim(tipDoc: string, numDocumento: string): Observable<GenericResponse> {
    const parameters = this.custom.GetParametersGroup();
    const data = '{"documentNumber":"' + numDocumento + '","documentType":"' + tipDoc + '"}';
    return this.httpClient.get<GenericResponse>(this.util.StringFormat(parameters.URLServicios.WsImeiTools,
    'consultaCim', data, 'Get', environment.header, 'V2.0'));
  }

  public insertDdocname(data: InsertDdocNameRequest): Observable<InsertDdocNameResponse> {
    const parameters = this.custom.GetParametersGroup();
    let request = JSON.stringify(data);
    request = request.replace(/"/g, `'`);
    return this.httpClient.post<InsertDdocNameResponse>(
      this.util.StringFormat(parameters.URLServicios.WsImeiTools, 'insertddocname',
      '"' + request + '"', 'Post', environment.header), '"' + request + '"',
      { headers: { 'Content-Type': 'application/json' } });
    }

  public GetDetailPayment(codeODS:string, idCst:number ): Observable<CstPaymentResponse>{
    const parameters = this.custom.GetParametersGroup();
    let request= '?codeODS='+ codeODS +  '&cst='+ idCst + '&' + environment.header;
    return this.httpClient.get<CstPaymentResponse>(
      this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp, this.cstPayment,
        'DetailPaymentService'+ request, 'Get', environment.header))
  }

  public NotifyPaymentCST(request:CstVerifyPaymentRequest, idCst: number): Observable<GenericResponse>{
    const parameters = this.custom.GetParametersGroup();
    return this.httpClient.post<GenericResponse>(
      this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp, this.cstPayment,
        'NotificationPayment?cst=' + idCst, JSON.stringify(request), 'Post', environment.header),
        JSON.stringify(request),{ headers: { 'Content-Type': 'application/json' } });
  }
  public GetCustomerByMin(min: string):Observable<GenericResponse>{
    const parameters = this.custom.GetParametersGroup();
    const url = String(parameters.URLServicios.WsPostSaleGeneral);
    let request = '?';
    if (url.includes('Rest')) {
      request += environment.header + '&min=' + min;
    } else {
      request += 'min=' + min;
    }
    return this.httpClient.post<GenericResponse>(
      this.util.StringFormat(url,this.controllerCustomerByMin + request,
        'Post', environment.header),
      '', httpOptions);
  }
  public postGetInvoice(customerId: string){
    const parameters = this.custom.GetParametersGroup();
    const url = String(parameters.URLServicios.WsPostSaleInvoice);
    let request = '?';
    if (url.includes('Rest')) {
      request += environment.header + '&customerId=' + customerId;
    } else {
      request += 'customerId=' + customerId;
    }
    return this.httpClient.post<GenericResponse>(
      this.util.StringFormat(url,
      this.controlerInvoice + request,
      'Post', environment.header),
      '', httpOptions);
  }

  }
