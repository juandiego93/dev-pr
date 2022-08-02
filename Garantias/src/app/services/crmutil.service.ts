import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from './../../environments/environment';

import { Util } from '../shared/util';
import { RequestCustomerTransaction, ResponseCustomerTransaction } from './../models/customerTransaction';
import { RequestCloseTransaction } from './../models/closeTransaction';
import { Parameter, RequestParameter, ResponseParameter } from './../models/parameter';
import { RequestSystemData, ResponseLastStep, ResponseSystemData } from './../models/systemdata';
import { TraceabilityOtp } from './traceabilityOtp.service';
import { RequestTraceabilityOtp } from '../models/traceabilityOtp';
import { Guarantee } from '../models/guarantee';
import { HeaderSMTP, MessageBox, MessageBox2, RootObjectSMTP, RequestNotificationSMTP } from '../models/notification';
import { CustomService } from './custom.service';



const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable({
  providedIn: 'root'
})
export class CrmutilService {

  private parameter= new Parameter;
  private traceability = { error: false } as RequestTraceabilityOtp;
  private respuestaNotificacion: RequestNotificationSMTP;

  constructor(private httpClient: HttpClient,
    private traceabilityWs: TraceabilityOtp,
    private util: Util,
    private customService: CustomService) { }

  //Método para guardar pasos
  public SaveStep(guarantee: Guarantee, otherData?: string, process?: string) {
    let request = new RequestSystemData();
    guarantee.numberStep = this.util.fullfilledField(guarantee.numberStep) ? guarantee.numberStep + 1 : 0;
    request.process = process !== undefined ? process : 'BEGIN';
    request.guid = guarantee.guid;
    const data = {};
    const nameStep = otherData !== undefined ? 'URL_RETURN' : guarantee.numberStep;
    data[nameStep] = otherData !== undefined ? otherData : JSON.stringify(guarantee);
    request.data = data;
    this.PostSYSTEM_DATA(request);
  }

  private PostSYSTEM_DATA(data: RequestSystemData): void {
    data.functionality = 'WARRANTY48';
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PostSYSTEM_DATA', dataTraza: data });
    let response: ResponseSystemData;
    this.httpClient.post<ResponseSystemData>(
      this.util.StringFormat(environment.urlCrmUtils, 'SystemData/PostSYSTEM_DATA',
        'process=' + data.process + '&functionality=' + data.functionality + '&guid=' + data.guid
        , 'Post', environment.header),
      data.data, httpOptions)
     .subscribe(
       r => response = r,
       () => this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'PostSYSTEM_DATA', valueTraza: response }),
       () => this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability,  descriptionTraza: 'PostSYSTEM_DATA', valueTraza: response }),
     );
  }

  public GetLastSetp(guid: string): Observable<ResponseLastStep> {
    return this.httpClient.post<ResponseLastStep>(
      this.util.StringFormat(environment.urlCrmUtils, 'SystemData/GetLastSetpByTransaction', 'strGuid=' + guid
        , 'Post', environment.header), null);
  }

  private GetParameterByGroup(data: RequestParameter): Observable<ResponseParameter[]> {
    return this.httpClient.post<ResponseParameter[]>(
      this.util.StringFormat(environment.urlCrmUtils, 'Parameter', 'strGroup=' + data.name
        , 'Post', environment.header), null);
  }

  public UpdateParameter(data: ResponseParameter): void {
    let response: ResponseParameter[];
    this.httpClient.post<ResponseParameter[]>(
      this.util.StringFormat(environment.urlCrmUtils, 'Parameter/UpdatePARAMETER', 'id=' + data.ID_PARAMETER
        , 'Post', environment.header), data).subscribe(
          datos => response = datos,
          () => this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'UpdateParameter', valueTraza: response }),
          () => this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability,  descriptionTraza: 'UpdateParameter', valueTraza: response }),
        );
  }
  public PostParameter(data: RequestParameter): Observable<ResponseParameter> {
    return this.httpClient.post<ResponseParameter>(
      this.util.StringFormat(environment.urlCrmUtils, 'Parameter', 'name=' + data.name
      , 'Post', environment.header), null);
  }

  public CloseTransaction(data: RequestCloseTransaction): Observable<string> {
    return this.httpClient.post<string>(
      this.util.StringFormat(environment.urlCrmUtils, 'CustomerTransaction/PostTransactionCustomerEndTransaction',
        'guidTransaction=' + data.guidTransaction + '&state=' + data.state
        , 'Post', environment.header), '{}', httpOptions);
  }

  public CreateTransaction(data: RequestCustomerTransaction): Observable<ResponseCustomerTransaction> {
    return this.httpClient.post<ResponseCustomerTransaction>(
      this.util.StringFormat(environment.urlCrmUtils, 'CustomerTransaction/PostTransactionCustomerGuid',
        'idTurn=' + data.idTurn + '&idFlow=' + data.idFlow + '&typeDocument=' +
        data.typeDocument + '&numberDocument=' + data.numberDocument
        , 'Post', environment.header), '{}', httpOptions);
  }

  public CompleteParametersGroup(groupParam: string): Promise<any>{
    return new Promise((resolve,reject) =>{
      this.SetParametersGroup(groupParam).subscribe(r=>{
        if(r !== false){
          resolve(r);
        } else{
          resolve(false);
        }
      });
    });
  }

  public SetParametersGroup(group: string): Observable<any> {
    let responseParameter: ResponseParameter[];
    let subject = new Subject<any>();
    const data: RequestParameter = {
      name: group
    }
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'SetParametersGroup- Parameter', dataTraza: data });
    this.GetParameterByGroup(data).subscribe(
      (responseParameter: ResponseParameter[]) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'SetParametersGroup- Parameter', valueTraza: responseParameter });
        responseParameter.forEach(parameter => {
          const name = parameter.NAME_PARAMETER ? parameter.NAME_PARAMETER.replace('_DEV', '').replace('_UAT', '').replace('_E2E','').replace('_PRD','') :parameter.NAME_PARAMETER;
          try {
            this.parameter[name] = JSON.parse(parameter.VALUE_PARAMETER); // Obtiene solo valor
            if (name === 'TOKEN_CASES') { this.parameter[name + '_P'] = parameter; } // Obtiene todo el response del parametro
          } catch {
            this.parameter[name] = parameter.VALUE_PARAMETER;
          }
        });
        subject.next(this.parameter);
      },
      error => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'SetParametersGroup- Parameter', valueTraza: responseParameter });
        this.util.OpenAlert('No fue posible consultar el grupo de parametros: ' + error.message, false);
        subject.next(false);
      }
    );
    return subject.asObservable();
  }

  public BodyNotification(phone?: string, email?: string, message?: string, type?: string) {
    // phone = "" // QUEMADO
    const params = this.parameter['HEADERNOTIFICATION'];
    const body = {} as RequestNotificationSMTP;
    let header = {} as HeaderSMTP;
    let rootObj = {} as RootObjectSMTP;
    const mensajeUno = {} as MessageBox;
    let mensajeDos = {} as MessageBox2;
    mensajeDos = params.mensajeDos;
    header = params.header;
    rootObj = params.rootObj;

    rootObj.subject = this.parameter.WARRANTY_MESSAGES.WarrantyNotification;

    rootObj.messageContent = message;

    // rootObj.profileId = email !== '' ? params.profileIdSMTP : params.profileIdSMS;
    // mensajeUno.messageChannel = email !== '' ? params.messageChannelSMTP : params.messageChannelSMS;
    // mensajeDos.customerBox = email !== '' ? email : phone;
    // mensajeUno.messageBox = [mensajeDos];
    // rootObj.messageBox = [mensajeUno];

    if(type === 'sms'){
      rootObj.profileId = params.profileIdSMS;
      mensajeUno.messageChannel = params.messageChannelSMS;
      mensajeDos.customerBox = phone;
      mensajeUno.messageBox = [mensajeDos];
      rootObj.messageBox = [mensajeUno];
    }else{
      rootObj.profileId = params.profileIdSMTP;
      mensajeUno.messageChannel = params.messageChannelSMTP;
      mensajeDos.customerBox = email;
      mensajeUno.messageBox = [mensajeDos];
      rootObj.messageBox = [mensajeUno];
    }

    body.headerRequest = header;
    body.message = JSON.stringify(rootObj);
    this.sendNotification(body, phone, email, message, type);
  }

  private sendNotification(data: RequestNotificationSMTP, phone, email, message, type) {
    this.httpClient.put(
      this.util.StringFormat(this.parameter.URLServicios.Notification,
      'PutMessage', JSON.stringify(data), 'Put', environment.header
      ), data).subscribe(
      datos => {
        this.respuestaNotificacion = datos as RequestNotificationSMTP;
        console.log('RespuestaNotificacion ',this.respuestaNotificacion);
        this.customService.DelCountError();        
        if(this.respuestaNotificacion['isValid'] === 'false'){
          this.util.OpenAlert('No fue posible envíar la notificación por email/sms', false);
        }
      }, error => {
        console.log(error);
        this.customService.AddCountError();
        // Agrega contador por si falla el servicio vuelva a enviar notificación por mensaje de texto o correo electrónico
        if(this.customService.GetCountError() <= environment.ic) {
          if(type === 'sms'){
            type = 'email';
            this.BodyNotification(phone, email, message, type);
          }else{
            type = 'sms';
            this.BodyNotification(phone, email, message, type);
          }
        }else{
          this.util.OpenAlert('Error en el servicio, no fue posible enviar la notificación por email/sms', false);
        }
      });
  }
}
