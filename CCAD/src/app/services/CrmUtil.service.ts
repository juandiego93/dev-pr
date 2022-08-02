import { CommonParameterClassServices } from 'src/app/services/commonparameterclassservices.service';
import { ResponseSystemData } from './../models/response-model/responsesystemdata';
import { RequestSystemData } from './../models/requests-models/requestsystemdata';
import { ResponseCustomerTransaction } from './../models/response-model/ResponseCustomerTransaction';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { RequestParameter } from '../models/requests-models/resquestParameter';
import { ResponseParameter } from '../models/response-model/ResponseParameter';
import { Observable } from 'rxjs';
import { RequestCloseTransaction, RequestCustomerTransaction } from '../models/requests-models/RequestCloseTransaction';
import { RequestTraceabilityLog } from 'src/app/models/requests-models/requesttraceabilitylog';
import { ResponseTraceabilityLog } from 'src/app/models/response-model/responsetraceabilitylog';
import { ResponseUltimoPaso } from 'src/app/models/response-model/responsesystemdata';
import { SimpleGlobal } from 'ng2-simple-global';
import { MatDialog } from '@angular/material/dialog';
import { ModalInformativoComponent } from '../shared/components/modal-informativo/modal-informativo.component';
import { environment } from 'src/environments/environment';
import { RequestDataValidation, ResponseDataValidation } from '../models/requests-models/RequestDataValidation';
import { HeaderSMTP, MessageBox, MessageBox2, Reqtorresmtp, RootObjectSMTP } from '../models/requests-models/reqtorresmtp';
import { NotificationService } from './notification.service';
import { CertificationData } from '../models/certificationdata';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};
@Injectable()
export class CrmUtilService {

  private readonly controllerParameter = 'Parameter';
  private readonly controllerCustomer = 'CustomerTransaction/PostTransactionCustomerGuid';
  private readonly serviceSystemData = 'SystemData/GetLastSetpByTransaction';
  private readonly serviceTraceability = 'TraceabilityLog/PostTRACEABILITY_LOG';
  private readonly urlDataValidation = 'DataValidation/UpdateCustomerNotification';
  private readonly systemData = 'SystemData/PostSYSTEM_DATA';

  constructor(private httpClient: HttpClient,
              private dialog: MatDialog,
              private notificationServ: NotificationService,
              private sg: SimpleGlobal,
              private common: CommonParameterClassServices) { }

  public postCreateTransaction(data: RequestCustomerTransaction): Observable<ResponseCustomerTransaction> {
    return this.httpClient.post<ResponseCustomerTransaction>(
      this.common.StringFormat(environment.urlCrmUtils, this.controllerCustomer,
      'idTurn=' + data.idTurn + '&idFlow=' + data.idFlow + '&typeDocument=' +
      data.typeDocument + '&numberDocument=' + data.numberDocument
      , 'Post', environment.header, environment.busV), '{}', httpOptions);
  }

  public postParameter(data: RequestParameter): Observable<ResponseParameter> {
    return this.httpClient.post<ResponseParameter>(
      this.common.StringFormat(environment.urlCrmUtils, this.controllerParameter, 'name=' + data.name
      , 'Post', environment.header, environment.busV), null);
  }

  public postCloseTransaction(data: RequestCloseTransaction): Observable<string> {
    return this.httpClient.post<string>(
      this.common.StringFormat(environment.urlCrmUtils, 'CustomerTransaction/PostTransactionCustomerEndTransaction',
      'guidTransaction=' + data.guidTransaction + '&state=' + data.state
      , 'Post', environment.header, environment.busV), '{}', httpOptions);
  }

  public saveStep(data: RequestSystemData, entity?: boolean) {
    const systemData = entity ? data.data :'{' + data.data + '}';
    return this.httpClient.post<ResponseSystemData>(
      this.common.StringFormat(environment.urlCrmUtils, this.systemData,
      'process=' + data.process + '&functionality=' + data.functionality + '&guid=' + data.guid
      , 'Post', environment.header, environment.busV),
      systemData, httpOptions)
      .subscribe(
        datos => {
          datos as ResponseSystemData;
          console.log(datos);
        }, error => console.log(error.message)
      );
  }

  public saveStepUnSub(data: RequestSystemData) {
    return this.httpClient.post<ResponseSystemData>(
      this.common.StringFormat(environment.urlCrmUtils, this.systemData,
      'process=' + data.process + '&functionality=' + data.functionality + '&guid=' + data.guid
      , 'Post', environment.header, environment.busV),
      '{' + data.data + '}', httpOptions)
  }

  public saveTraceability(data: RequestTraceabilityLog) {
    return this.httpClient.post<ResponseTraceabilityLog>(
      this.common.StringFormat(environment.urlCrmUtils, this.serviceTraceability,
      'service=' + data.service + '&method=' + data.method + '&guid=' + data.guid +
      '&typed=' + data.typed
      , 'Post', environment.header, environment.busV), '"' + data.data + '"', httpOptions)
      .subscribe(datos => {}, error => console.log(error.message));
  }

  public readLastStep(guid: string = this.sg['guid']): Observable<ResponseUltimoPaso> {
    return this.httpClient.post<ResponseUltimoPaso>(
      this.common.StringFormat(environment.urlCrmUtils, this.serviceSystemData, 'strGuid=' + guid
      , 'Post', environment.header, environment.busV), null);
  }

  public dataValidation(data: RequestDataValidation): Observable<ResponseDataValidation> {
     return this.httpClient.post<ResponseDataValidation>(
      this.common.StringFormat(environment.urlCrmUtils, this.urlDataValidation,
      'LastModified=' + data.LastModified,
      'Post', environment.header, environment.busV), httpOptions);
  }

  showModal(msg, success = true) {
    this.dialog.open(ModalInformativoComponent, {
      disableClose: true,
      data: msg,
      id: success ? 'modalAlerta' : 'modalAlertaFail',
    });
  }

  // Método que construye el cuerpo del mensaje de texto/email y llama a método de envío de notificación.
  public setBodyNotification(typeNotif: string, numberTel?: string, correo?: string, notifForm?: string, name?: string) {
    let responseParameter: ResponseParameter;
    const data = new RequestParameter();
    data.name = 'HEADERNOTIFICATION';
    this.postParameter(data).subscribe(param => responseParameter = param,
      () => { console.log('Servicio Parametros no responde'); },
      () => {
        const params = JSON.parse(responseParameter.VALUE_PARAMETER);
        const body = {} as Reqtorresmtp;
        let header = {} as HeaderSMTP;
        let rootObj = {} as RootObjectSMTP;
        const mensajeUno = {} as MessageBox;
        let mensajeDos = {} as MessageBox2;
        mensajeDos = params.mensajeDos;
        header = params.header;
        rootObj = params.rootObj;
        rootObj.messageContent = `Señor/a ${ name || 'usuario'}, el proceso de certificación de cuenta al dia
                ${ typeNotif === 'email' ? ' enviado a su correo electronico' : ' enviado a su residencia '} se ha realizado correctamente.`;;
        rootObj.profileId = notifForm === 'EMAIL' ? params.profileIdSMTP : params.profileIdSMS;
        mensajeUno.messageChannel = notifForm === 'EMAIL' ? params.messageChannelSMTP : params.messageChannelSMS;
        mensajeDos.customerBox = notifForm === 'EMAIL' ? correo : numberTel;
        mensajeUno.messageBox = [mensajeDos];
        rootObj.messageBox = [mensajeUno];
        body.headerRequest = header;
        body.message = JSON.stringify(rootObj);
        this.notificationServ.putSendNotificationEmail(body)
            .subscribe(resp => {
              console.log('Envío de '  + notifForm + ' => ' + resp);
              this.common.NotificationSent().next(resp);
            });
      });
  }

  /**
   * Método para guardar pasos con datos desde entidad cad
   * @author CINDY PANCHE - 17 Sep 2021
   */
  public SaveStepEntity(step: string, cad: CertificationData, otherData?: string, process?: string) {
    let request = new RequestSystemData();
    request.process = process !== undefined ? process : 'BEGIN';
    request.guid = cad.guid;
    const data = {};
    data[step] = otherData !== undefined ? otherData : JSON.stringify(cad);
    request.data = data;
    request.functionality = 'CUENTASALDIA';
    this.saveStep(request, true);
  }
}
