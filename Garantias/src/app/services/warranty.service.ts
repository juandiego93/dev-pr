import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Subject } from 'rxjs';

import { CustomService } from './custom.service';
import { Util } from './../shared/util';
import { TraceabilityOtp } from './traceabilityOtp.service';
import { RequestTraceabilityOtp } from '../models/traceabilityOtp';
import { RuleRequest, RuleResponse } from './../models/rule';
import { Warranty } from '../models/case';
import { ODSRequest, ODSResponse, UploadedFileResponse } from '../models/ods';
import { WarrantyOds } from '../models/warranty-ods';
import { HEADER_REQUEST } from '../models/headerRequest';


@Injectable()
export class WarrantyService {

  private lstRules: any;
  private traceability = { error: false } as RequestTraceabilityOtp;
  private listWarranty: Warranty[];
  private readonly controllerLists ='GetLists/';
  private  breachTimeDays: number
  constructor(private http: HttpClient,
              private util: Util,
              private traceabilityWs: TraceabilityOtp,
              private custom: CustomService
  ) {

  }

  private GetRules(request: RuleRequest): Observable<RuleResponse> {
    const parameters = this.custom.GetParametersGroup();
    const url = parameters.URLSERVICIOSG.WsPostSaleInspParam;
    let req= request.idFlow.toString();
    if (url.includes('Rest')) {
      req= 'flowId=' + request.idFlow.toString() + '&' + environment.header;
    }
    const requestValue = this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInspParam, 'PostSaleInspWarranty','GetRuleByFlow', req , environment.header);
    return this.http.get<RuleResponse>(requestValue)
  }

  public GetListRules() {
    return this.lstRules;
  }

  public GetRulesWarranty48(idFlow: number) {
    let req: RuleRequest = {
      ruleName: null,
      idFlow: idFlow
    }
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetRulesWarranty48 - GetRules', dataTraza: req });
    let resp: RuleResponse;
    let subject = new Subject<any>();
    this.GetRules(req).subscribe(
      data => resp = data,
      () => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'GetRulesWarranty48 - GetRules', valueTraza: resp });
        if(this.custom.GetCountError() <= environment.ic){
          this.custom.SetMessageError = 'No fue posible consultar reglas ';
          subject.next(false);
        }
      },
      () => {
        if (resp.isValid && resp.rulesWarranty.length >0 ) {
          this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetRulesWarranty48 - GetRules', valueTraza: resp });
          this.lstRules = resp.rulesWarranty;
          subject.next(this.lstRules);
        } else {
          this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'GetRulesWarranty48 - GetRules', valueTraza: resp.message });
          this.util.OpenAlert('No fue posible consultar reglas: ' + resp.message, false);
        }
      }
    );
    return subject.asObservable();
  }
  public GetListWarranty(){
    return this.listWarranty;
  }
  public GetLists(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'getListStates - WsWarranty', dataTraza: '' });
      const parameters = this.custom.GetParametersGroup();
      this.http.get<any>(this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp, 'PostSaleInspWarranty', 'GetLists?' + environment.header)).subscribe(
        response => {
          this.custom.DelCountError();
          if (!response.isValid) {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'getListStates - WsWarranty', valueTraza: response });
            this.util.OpenAlert('No fue posible consultar tipos de documento: ' + response.message, false);
            resolve(false);
          } else {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'getListStates - WsWarranty', valueTraza: response });
            response?.listWarranty !== undefined && response?.listWarranty?.length > 0 ? this.listWarranty = response.listWarranty : this.util.OpenAlert('no se obtuvieron listas parametrizadas Garantias', false);
            resolve(true);
          }
        },
        error => {
          this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'getListStates - WsWarranty', valueTraza: error.message });
          this.custom.AddCountError();
          resolve(false);
        }
      )
    });
  }
  public GetODS(data: ODSRequest): Observable<ODSResponse> {
    const parameters = this.custom.GetParametersGroup();
    return this.http.post<ODSResponse>(
      this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp,'PostSaleInspODS','GetODS'),
      JSON.stringify(data), {headers: { 'Content-Type': 'application/json' }
    });
  }
  public GetUploadedFile(idODS: any):Observable<UploadedFileResponse>{
    const parameters = this.custom.GetParametersGroup();
    return this.http.get<UploadedFileResponse>(
      this.util.StringFormat(parameters.URLSERVICIOSG.WsPostSaleInsp,'PostSaleInspUploadedFile','GetUploadedFile/' + idODS + '?' + environment.header, environment.header)
    )
  }

  /** Devuelve el objeto lleno de la request de UpdateODS */
  public GetUpdateODSRequest(odsInfo: any): WarrantyOds {
    const { client, state, tsc, user, period } = odsInfo.selectedCase
    const { enterWithAccessories, failure, condition, observationsD, warrantyReplacement,
            customerDeliversEquipmentCAV, faultReported, idOds, equipment, entryDate} = odsInfo.odsOfCase
    return { headerRequest: HEADER_REQUEST,
      idOds, client, equipment, period, state, tsc, user, failure, condition, observationsD,
      enterWithAccessories, warrantyReplacement, customerDeliversEquipmentCAV, faultReported, entryDate
    }
  }

  public set setBreachTimeDays(value: number){
    this.breachTimeDays = value
  }

  public get getBreachTimeDays(): number {
    return this.breachTimeDays
  }


}
