import { RequestDeleteSC, ResponseSCToken,ResponseSCId,DesactiveItemSCRequest } from './../models/shopping-cart.interface';
import { HttpClient,HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

import { RequestPresencialBizInteraction, ResponseGetBizInteraction } from '../models/bizinteractions';
import { Util } from '../shared/util';
import { CustomService } from './custom.service';
import { GetCaseRequest, GetCaseResponse, InternalCaseResponse } from '../models/case';
import { TraceabilityOtp } from './traceabilityOtp.service';
import { RequestTraceabilityOtp } from '../models/traceabilityOtp';
import { InventoryLoanAmountRequest, InventoryLoanAmountResponse } from './../models/inventoryLoanAmount';
import { CatalogManagementRequest, CatalogManagementResponse } from './../models/catalogManagement';
import { RequestsEndAttention } from '../models/requestEndAttention';
import { SimpleGlobal } from 'ng2-simple-global';
import { DataTransform, WsSoapService } from 'ws-soap-lib';
import { Guarantee } from '../models/guarantee';
import { CavServiceResponse } from '../models/cav';
import { InventoryCreateOrderReturnRequest, SapInventoryRequest, SapInventoryResponse } from '../models/sapInventory';
import { QueryAddressRequest, QueryAddressResponse } from '../models/queryAddress';
import { BillingCycleRequest, BillingCycleResponse } from '../models/billingCycle';
import { WarrantyOds } from '../models/warranty-ods';
import { IGetConcepts, IGetConceptsResponse } from '../models/getConcepts';
import { IApplyAdjustment } from '../models/ApplyAdjustment';
import { SuccessFactorInfo } from '../models/successFactor';
import { ResponseEntryPoint } from '../models/shopping-cart.interface';
import { ContextAttributeRequest,ContextAttributeResponse } from './../models/contextAttribute';

@Injectable({
  providedIn: 'root'
})
export class ExternalService {

  private readonly controllerPresencialBiz = 'setPresencialBizInteraction';
  private traceability = { error: false } as RequestTraceabilityOtp;
  private readonly controllerNotification = 'PutMessage';

  private datosBridge: RequestsEndAttention

  constructor(private httpClient: HttpClient,
              private util: Util,
              private custom: CustomService,
              private traceabilityWs: TraceabilityOtp,
              private sg: SimpleGlobal,
              private wsSoapService: WsSoapService,
  ) { }

  public SetPresencialBizInteraction(data: RequestPresencialBizInteraction): Observable<ResponseGetBizInteraction> {
    const userName= sessionStorage.getItem('userName');
    const userLocation= sessionStorage.getItem('userLocation');
    const userNameLocation= sessionStorage.getItem('userNameLocation');
    if(userName || userLocation || userNameLocation){
      data.mapValues = {
        userName: userName,
        userLocation: userLocation,
        userNameLocation: userNameLocation
      }
    }
    delete data.headerRequestBizInteraction;
    const jsonData = JSON.stringify(data);
    const parameters = this.custom.GetParametersGroup();

    return this.httpClient.put<ResponseGetBizInteraction>(
      this.util.StringFormat(parameters.URLServicios.BIZInteractions,
      this.controllerPresencialBiz, jsonData, 'put', environment.header),
      null, {headers: { 'Content-Type': 'application/json' }
    });
  }

  public GetCase(data: GetCaseRequest): Observable<GetCaseResponse> {
    const parameter = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameter.URLSERVICIOSG.WsPostSaleInsp,'PostSaleInspInternalCase','GetInternalCase' );
    return this.httpClient.post<GetCaseResponse>(url, data, {headers: { 'Content-Type': 'application/json' }});
  }

  public UpdateCase(data: InternalCaseResponse):Observable<GetCaseResponse> {
    const parameters = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp, 'PostSaleInspInternalCase','UpdateInternalCase' )
    return this.httpClient.put<GetCaseResponse>(url,data, {headers: { 'Content-Type': 'application/json' }});
  }

  public UpdateODS(data: WarrantyOds):Observable<GetCaseResponse> {
    const parameters = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp,'PostSaleInspODS','UpdateODS')
    return this.httpClient.put<GetCaseResponse>(url,data, {headers:  { 'Content-Type': 'application/json' }});
  }

  public GetCavByName(nameCav: string): Observable<CavServiceResponse> {
    // nameCav = "NoCavs" // QUEMADO
    const parameters = this.custom.GetParametersGroup();
    let request= nameCav +'?' + environment.header;
    return this.httpClient.get<CavServiceResponse>(this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp,'PostSaleInspCAV', 'QueryByNameCav/'+ request));
  }

  public PostCloseAttention(formData: FormData): Observable<RequestsEndAttention> {
    try {
      const parameters = this.custom.GetParametersGroup();
      formData.forEach((value, key) => {
        this.datosBridge = { ...this.datosBridge, [key]: value };
      });
      this.datosBridge.URL = parameters.URLServicios.WsCloseAttention
      this.datosBridge.GUID = this.sg['guid']
      console.log('Datos al micrositio: ', this.datosBridge);
    } catch (error) {
      console.log('Error en finalizar atención', error)
      throwError(error)
    }
    return of(this.datosBridge)
  }

  public PutSapInventoryInfo(data: SapInventoryRequest): Observable<SapInventoryResponse> {
    const parameters = this.custom.GetParametersGroup();
    return this.httpClient.put<SapInventoryResponse>(parameters.URLSERVICIOSG.WsSapInventory,
      data, {headers:  { 'Content-Type': 'application/json' }});
  }

  public GetInventoryLoanAmoun(data: InventoryLoanAmountRequest): Observable<InventoryLoanAmountResponse> {
    const parameters = this.custom.GetParametersGroup();
    return this.httpClient.get<InventoryLoanAmountResponse>(this.util.StringFormat(parameters.URLSERVICIOSG.WsInventoryLoanAmount,
      data.sku ,data.serial, data.user));
  }

  public PostCatalogManagement(request: CatalogManagementRequest): Observable<CatalogManagementResponse> {
    const parameter = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameter.URLSERVICIOSG.WsCatalogManagement, request.parameters.id,request.parameters.idBusinessTransaction,
      request.parameters.idApplication, request.parameters.userApplication, request.parameters.startDate);
    return this.httpClient.post<CatalogManagementResponse>(url, request.body, {headers: { 'Content-Type': 'application/json' }});
  }

  public putSendNotificationEmail(emailBody) {
    const parameter = this.custom.GetParametersGroup();
    return this.httpClient.put(this.util.StringFormat(parameter.URLServicios.Notification,
      this.controllerNotification, JSON.stringify(emailBody), 'Put', environment.header), emailBody,
      { headers: { 'Content-Type': 'application/json' } });
  }

  public getSuccessFactorInfo(guarantee: Guarantee): Promise<SuccessFactorInfo>{
    return new Promise ((resolve) => {
      const parameters = this.custom.GetParametersGroup();
      const wsSuccessFactor = parameters.URLSERVICIOSG.WsSuccessFactor;
      const {Url: url, Xml: xmlString} = wsSuccessFactor
      const data = {
        arrayData: [
          // Header
          { name: 'requestDate', value: this.util.ActualDate() },
          { name: 'user', value: guarantee.idUser },
          // Body
          { name: 'getOperation', value: "consultUser" },
          { name: 'message', value: 'messageJson' },
        ]
      } as DataTransform;
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeSuccessFactor', dataTraza: xmlString });
      this.wsSoapService.getDataXMLTrans(xmlString, data).then(
        (xml) => {
          const message = `{"documentId": ${guarantee.documentNumberAdvisor},"networkUser": "${guarantee.idUser}"}`
          xml = xml.replace('messageJson', message)
          this.wsSoapService.wsSoap(url, xml).then(
            (jsonResponse) => {
              this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeSuccessFactor', valueTraza: jsonResponse });
              try {
                this.wsSoapService.getObjectByElement(jsonResponse, 'ns0:getResponse').then(
                  (response) => {
                    if(response.length > 0 && (response[0]['ns0:isValid'][0]).toLowerCase() === 'true'){
                      guarantee.successFactorInfo = JSON.parse(response[0]['ns0:message'][0])
                      sessionStorage.setItem('nameCav', guarantee.successFactorInfo.salePoint)
                      resolve(guarantee.successFactorInfo)
                    }else {
                      this.util.OpenAlert('success factor no devolvió información de Cav de usuario', false);
                      guarantee.successFactorInfo = undefined
                      resolve(guarantee.successFactorInfo)
                    }
                  }
                );
              } catch (error) {
                this.util.OpenAlert('Error al consultar servicio de success factor: ' + error + '. ' +
                parameters.WARRANTY_MESSAGES.EndAttention, false);
                resolve(undefined)
              }
            }, (error) => {
              // this.util.OpenAlert('Error al consultar servicio de success factor: ' + error + '. ' +
              //   parameters.WARRANTY_MESSAGES.EndAttention, false);
              this.custom.SetMessageError = 'Error en servicio para consultar servicio de success factor';
              this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeSuccessFactor', valueTraza: error, error: true });
              resolve(undefined)
            }
          );
        },
        (error) => {
          this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeSuccessFactor', valueTraza: error, error: true });
          this.util.OpenAlert('Error al consultar servicio para consulta de success factor: ' + error + '. ' +
          parameters.WARRANTY_MESSAGES.Refresh, false);
        }
      );
    })
  }

  public PutQueryAddress(request: QueryAddressRequest): Observable<QueryAddressResponse> {
    const parameters = this.custom.GetParametersGroup();
    return this.httpClient.put<QueryAddressResponse>(parameters.URLSERVICIOSG.WsQueryAddress,
      request, {headers:  { 'Content-Type': 'application/json' }});
  }

  public PostBillingCycle(request: BillingCycleRequest): Observable<BillingCycleResponse> {
    const parameter = this.custom.GetParametersGroup();
    return this.httpClient.post<BillingCycleResponse>(parameter.URLSERVICIOSG.WsBillingCycle, request, {headers: { 'Content-Type': 'application/json' }});
  }

  public PostGetConcepts(request: IGetConcepts): Observable<IGetConceptsResponse> {
    const parameter = this.custom.GetParametersGroup();
    const parameters = `transactionId=${request.transactionId}&system=${request.system}&target=${request.target}&user=${request.user}&password=${request.password}&requestDate=2008-09-28T20:49:45&ipApplication=${request.ipApplication}&traceabilityId=${request.traceabilityId}&indicatorId=${request.indicatorId}`
    let url = this.util.StringFormat(parameter.URLServicios.WsPostSaleDevolution, `GetConcepts?${parameters}`);
    return this.httpClient.post<IGetConceptsResponse>(url, {}, {headers: { 'Content-Type': 'application/json' }});
  }

  public PostApplyAdjustment(request: IApplyAdjustment): Observable<any> {
    const parameter = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameter.URLServicios.WsPostSaleDevolution, 'ApplyAdjustment');
    return this.httpClient.post<any>(url, request, {headers: { 'Content-Type': 'application/json' }});
  }

  public GetHolidayByYear(year: any): Observable<any>  {
    const parameters = this.custom.GetParametersGroup();
    let request = 'year=' + year + '&' + environment.header;
    return this.httpClient.get<any>(this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp,'PostSaleInspUtils', 'GetHolidayByYear?'+ request));
  }
  
  public PutSapInventoryByImei(data: SapInventoryRequest): Observable<SapInventoryResponse> {
    const parameters = this.custom.GetParametersGroup();
    return this.httpClient.put<SapInventoryResponse>(parameters.URLSERVICIOSG.WsSapInventory, data, {headers:  { 'Content-Type': 'application/json' }});
  }

  public PostSalesEntryPoint(request:any): Observable<ResponseEntryPoint> {
    const parameter = this.custom.GetParametersGroup();
    let url = parameter.URLSERVICIOSG.WsSalesEntryPoint;
    return this.httpClient.post<ResponseEntryPoint>(url, request, {headers: { 'Content-Type': 'application/json' }});
  }

  public GetSalesSCByToken(token:string): Observable<ResponseSCToken> {
    const parameter = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameter.URLSERVICIOSG.WsSalesSCByToken, token) + "/getExistingSCByToken";
    return this.httpClient.get<ResponseSCToken>(url);
  }
  
  public DesactiveItemSC(request:DesactiveItemSCRequest): Observable<ResponseSCId>{
    const parameter = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameter.URLSERVICIOSG.WsSalesOrderItem, "deactivateItem");
    return this.httpClient.post<ResponseSCId>(url, request, {headers: { 'Content-Type': 'application/json' }});
  }

  public DeleteItemSC(item:RequestDeleteSC):Observable<ResponseSCId>{
    let httpParams = new HttpParams().set('scID', item.scID);
    httpParams.set('itemID', item.itemID);
    httpParams.set('subType', item.subType);
    httpParams.set('returnPrices', item.returnPrices === true ? 'true' : 'false');

    let params = { params: httpParams };

    const parameter = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameter.URLSERVICIOSG.WsSalesSCByToken, "deleteItem");
    
    return this.httpClient.delete<ResponseSCId>(url,params);
  }

  public SubmitItemSC(scID:string,request:any): Observable<ResponseSCId>{
    const parameter = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameter.URLSERVICIOSG.WsSalesSCByToken, scID) + "/submitSC";
    return this.httpClient.post<ResponseSCId>(url, request, {headers: { 'Content-Type': 'application/json' }});
  }

  public PutSapCreateOrder(request: InventoryCreateOrderReturnRequest) {
    const parameter = this.custom.GetParametersGroup();
    let url = parameter.URLSERVICIOSG.WsSapInventoryCreateOrder;
    return this.httpClient.put(url, request, {headers: { 'Content-Type': 'application/json' }});
  }
 
  public GetContextAttribute(data:ContextAttributeRequest): Observable<ContextAttributeResponse> {
    const parameter = this.custom.GetParametersGroup();
    let url = this.util.StringFormat(parameter.URLSERVICIOSG.WsContextAttributes, data.documentType, data.id.toString(), data.account) ;
    return this.httpClient.get<ContextAttributeResponse>(url);
  } 
}
