import { CommonParameterClassServices } from 'src/app/services/commonparameterclassservices.service';
import { ResponseCTypification } from './../models/response-model/ResponseCTypification';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RequestCertificadoCuenta } from '../models/requests-models/request-certificado-cuenta';
import { RequestCaseTypification } from '../models/requests-models/RequestCaseTypification';
import { ResponseIdType, ResultIdType } from '../models/response-model/response-id-type';
import { UploadDocument } from '../models/requests-models/request-upload-document';
import { RequestKnowledgeBase } from '../models/requests-models/requestKnowledgeBase';
import { ResponseKnowledgeBase } from '../models/response-model/responseKnowledgeBase';
import { SimpleGlobal } from 'ng2-simple-global';
import { ResponseLuhn } from '../models/response-model/responseluhn';
import { RequestParameter } from '../models/requests-models/resquestParameter';
import { CrmUtilService } from './CrmUtil.service';
import { RuleRequest } from '../models/requests-models/request-rule';
import { RuleResponse } from '../models/response-model/response-rule';
import { MensajesAplicacion } from '../models/response-model/ResponseParameter';

@Injectable({providedIn: 'root'})
export class CertificacionCuentaService {

  listIdDocumentType = new Array<ResponseIdType>();
  typeItem: ResultIdType;
  listJson = [];
  responseDataDocument;
  private readonly controllerPayment = 'getpaymentreferences';
  private readonly controllerCasetyp = 'casetypification';
  private readonly controllerTypeDocument = 'typedocument';
  private readonly controllerKnowledgeBase = 'KnowledgeBase';
  private readonly controllerUploadDoc = 'uploadfilesftp';
  private requestParameter = new RequestParameter();
  private urlPostSaleInsp;
  private lstRules: any;
  private messages: MensajesAplicacion;

  constructor(private http: HttpClient,
              private sg: SimpleGlobal,
              private crmUtilService: CrmUtilService,
              private common: CommonParameterClassServices) { }

  getPaymentReferences(requestParams: RequestCertificadoCuenta): Observable<ResponseLuhn> {
    return this.http.get<ResponseLuhn>(this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
        this.controllerPayment, JSON.stringify(requestParams),
        'Get', environment.header, environment.busV));
  }

  getcaseTypification(data: RequestCaseTypification): Observable<any> {
    const dataConsolidada = '{"headerRequest":{"idBusinessTransaction": "' + data.headerRequest.idBusinessTransaction +
     '","idApplication": "' + data.headerRequest.idApplication + '","target":"' + data.headerRequest.target + '","startDate": "' +
      data.headerRequest.startDate + '","channel":"' + data.headerRequest.channel + '"},"service":"' + data.service + '"}';
    return this.http.get<ResponseCTypification>(
      this.common.StringFormat(this.sg['Servicios'].WsImeiTools,
      this.controllerCasetyp, dataConsolidada, 'Get', environment.header, environment.busV));
  }

  getDocuments() {
    return this.listIdDocumentType;
  }

  /** Método que hace un llamado al API para obtener la base de conocimiento según parámetros enviados. */
  getKnowledegeBase(request: RequestKnowledgeBase): Observable<ResponseKnowledgeBase> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<ResponseKnowledgeBase>(
      this.common.StringFormat(environment.urlCrmUtils, this.controllerKnowledgeBase,
      'strNameFunctionality=' + request.strNameFunctionality + '&strNameProcess=' +
      request.strNameProcess + '&strNameKnowledge=' + request.strNameKnowledge
      , 'Post', environment.header, environment.busV), '', httpOptions);
  }

  postUploadDocument(document: string) {
    const url = this.common.StringFormat(this.sg['Servicios'].WsImeiTools, this.controllerUploadDoc, '', 'POST', environment.header, environment.busV).replace('&message=', '');
    return this.http.post(url, '\"' + document + '\"', {
      headers: {'Content-Type': 'application/json'}
    });
  }

  public getIdDocumentType() {
    const servidores = this.sg['Servicios'];
    if (servidores === undefined) {
      this.requestParameter.name = 'URLServicios';
      this.crmUtilService.postParameter(this.requestParameter)
        .subscribe(
          dataResponseParametroServidores => {
            this.sg['Servicios'] = JSON.parse(dataResponseParametroServidores.VALUE_PARAMETER);
            sessionStorage.Servicios = btoa(dataResponseParametroServidores.VALUE_PARAMETER);
            this.getIdDocumentType();
          });
    } else {
      this.http.get(this.common.StringFormat(servidores.WsImeiTools,
                    this.controllerTypeDocument, '""', 'Get', environment.header, environment.busV))
        .subscribe(
          data => this.responseDataDocument = data,
          () => console.error('Falló la consulta TipoDocumento'),
          () => this.CreateArrayListDocument()
        );
    }
  }

  private CreateArrayListDocument() {
    if (this.listIdDocumentType.length === 0) {
      this.listJson = JSON.parse(this.responseDataDocument.message);
      this.listJson.find(cd => cd.Description.trim() === '').Description = 'Seleccione...';
      this.listJson.forEach(element => {
        this.typeItem = new ResultIdType();
        this.typeItem.Description = element.Description;
        this.typeItem.Code = element.Code;
        this.typeItem.id = this.addIdDocumentToType(element.Code);
        this.listIdDocumentType.push(this.typeItem);
      });
    }
  }

  private addIdDocumentToType(code) {
    switch (code) {
      case "CC": {
        return "1";
        break;
      }
      case "TI": {
        return "2";
        break;
      }
      case "CE": {
        return "3";
        break;
      }
      case "PA": {
        return "4";
        break;
      }
      case "NI": {
        return "5";
        break;
      }
      case "CD": {
        return "6";
        break;
      }
      case "NU": {
        return "7";
        break;
      }
      default: {
        return "";
      }

    }
  }

  public GetUrlPostSaleInsp(idFlow: number){
   this.requestParameter.name = 'URLSERVICIOSG';
      this.crmUtilService.postParameter(this.requestParameter)
        .subscribe(
          dataResponseParametroServidores => {
            const urls = JSON.parse(dataResponseParametroServidores.VALUE_PARAMETER);
             this.urlPostSaleInsp = urls.WsPostSaleInspParam;
             this.GetRulesCTA(idFlow);
          },
          error => {
            this.crmUtilService.showModal('Error al consultar parametro: URLSERVICIOSG: ' + error.error.Message, false);
          });
  }

  private GetRulesCTA(idFlow:number) {
    let req: RuleRequest = {
      ruleName: null,
      idFlow: idFlow
    }
    let resp: RuleResponse;
    let subject = new Subject<any>();
    this.GetRules(req).subscribe(
      data => resp = data,
      () => {
        this.crmUtilService.showModal('No fue posible consultar reglas.', false);
      },
      () => {
        if (resp.isValid) {
          this.lstRules = resp.rulesWarranty;
          subject.next(this.lstRules);
        } else {
          this.crmUtilService.showModal('No fue posible consultar reglas: ' + resp.message, false);
        }
      }
    );
    return subject.asObservable();
  }

  private GetRules(request: RuleRequest): Observable<RuleResponse> {
    let req = request.idFlow.toString();
    if (this.urlPostSaleInsp.includes('Rest')) {
      req = 'flowId=' + request.idFlow.toString() + '&' + environment.header;
    }
    return this.http.get<RuleResponse>(
      this.common.StringFormat(this.urlPostSaleInsp, 'PostSaleInspWarranty', 'GetRuleByFlow', req, environment.header, 'Get'))
  }

  public GetListRules() {
    return this.lstRules;
  }

  public SetMessages(mess: MensajesAplicacion): void {
    this.messages = mess;
  }

  public GetMessages(): MensajesAplicacion {
    return this.messages;
  }
}
