import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http';

import { RequestPresencialBizInteraction, HeaderRequestBizInteraction } from 'src/app/models/requests-models/RequestPresencialBizInteraction';
import { DataParameterHeader } from 'src/app/models/DataParameterHeader';
import { RequestInventario, HeaderRequestInventario } from 'src/app/models/requests-models/requestinventario';
import { Observable, Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CommonParameterClassServices {
  request = new RequestPresencialBizInteraction();
  dataParameterHeader: DataParameterHeader;
  customerCode: string;
  requestInventario = new RequestInventario();
  headerRequest: HeaderRequestInventario;
  headerAddres: any;
  constructor() { }

  OpenTurnService(turnValue: any, idTurn: string, presencialChannel: boolean, customerCode: string, biheaderId: string, serviceId: string){
    this.request.idEvent = turnValue;
    if(idTurn !== '' && idTurn !=='0' && idTurn !== undefined){
      this.request.idTurn = idTurn;
    }
    this.request.presencialChannel = presencialChannel;
    this.request.customerCode = customerCode;
    this.request.biHeaderId = biheaderId;
    this.request.executionDate = this.buildDate();
    this.request.interactionDirectionTypeCode = "0";//En el request de ejemplo valor creo en string
    this.request.service = serviceId;
    return this.request;

  }

  headerRequestInventario(objetoParams) {
    this.headerRequest = new HeaderRequestInventario();
    if (this.dataParameterHeader === undefined)
    {
      this.dataParameterHeader = JSON.parse(objetoParams);
    }
    this.headerRequest.transactionId = this.dataParameterHeader.string;
    this.headerRequest.system = this.dataParameterHeader.string;
    this.headerRequest.target = this.dataParameterHeader.string;
    this.headerRequest.user = this.dataParameterHeader.string;
    this.headerRequest.password = this.dataParameterHeader.string;
    this.headerRequest.requestDate = this.buildDate();
    this.headerRequest.ipApplication = this.dataParameterHeader.string;
    this.headerRequest.traceabilityId = this.dataParameterHeader.string;
    return this.headerRequest;
  }

  buildDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    const hour = String(today.getHours()).padStart(2, '0');
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const strDate = year + '-' + month + '-' + day + 'T' + hour + ':' + minutes + ':' + '00';
    return strDate;
  }

  public StringFormat(str: string, ...args: string[]): string {
    return str.replace(/{(\d+)}/g, (match, index) => args[index] || '');
  }
  public returnHeaderAddres():any{
    this.headerAddres = {
      "transactionId" : "transactionId249",
      "system" : "system250",
      "target" : "target",
      "user" : "user251",
      "password" : "password252",
      "requestDate" : new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
      "ipApplication" : "ipApplication253",
      "traceabilityId" : "traceabilityId254"
      };
      return this.headerAddres;
  }

  public NotificationSent(): Subject<any> {
    return this.NotificationSentSource;
  }

  private NotificationSentSource: Subject<boolean> = new Subject<boolean>();
  createTransaction: Observable<boolean> = this.NotificationSentSource.asObservable();
}
