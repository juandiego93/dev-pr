import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SimpleGlobal } from 'ng2-simple-global';
import { environment } from '../../environments/environment';
import { MatDialog } from '@angular/material/dialog';

import { RequestTraceabilityOtp, ResponseTraceabilityOtp } from 'src/app/models/traceabilityOtp';
import { Util } from './../shared/util';
import { CustomService } from './custom.service';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
  })
};

@Injectable()
export class TraceabilityOtp {


  constructor(private http: HttpClient,
              private sg: SimpleGlobal,
              private dialog: MatDialog,
              private custom: CustomService
  ) {

  }

  public InsertTraceabilityOtp(request: RequestTraceabilityOtp): void {
    const document = sessionStorage.getItem('documentNumber') !== undefined && sessionStorage.getItem('documentNumber') !== null
    ? sessionStorage.getItem('documentType') + '-' + sessionStorage.getItem('documentNumber') : 'N/A';
    const min = sessionStorage.getItem('min') !== undefined && sessionStorage.getItem('min') !== null ? sessionStorage.getItem('min') : 'N/A';
    request.documentTraza = request.documentTraza === undefined ? document : request.documentTraza;
    request.medioTraza = request.medioTraza === undefined ? min : request.medioTraza;
    request.cvcTraza = this.sg['guid'] === undefined ? request.documentTraza : this.sg['guid'];
    request.userCreate = sessionStorage.getItem('idUser') !== undefined && sessionStorage.getItem('idUser') !== null ? sessionStorage.getItem('idUser') : 'N/A';
    request.applicationTraza = 'Garantias';
    request.flowTraza = '48'
    request.descriptionTraza = request.dataTraza !== undefined ? 'IN - ' + request.descriptionTraza : 'OUT - ' + request.descriptionTraza;
    request.dataTraza = request.dataTraza !== '' && request.dataTraza !== undefined ? JSON.stringify(request.dataTraza).replace(/"/g, `'`) : '';
    if (request.valueTraza !== '' && request.valueTraza !== undefined) {
      request.valueTraza = JSON.stringify(request.valueTraza).replace(/"/g, `'`);
      request.valueTraza = request.error ? 'Error: ' + request.valueTraza : request.valueTraza;
    }
    this.CreateTraceabilityOtp(request);
  }

  public CreateTraceabilityOtp(req: RequestTraceabilityOtp) {
    const reqBus = {
      "headerRequest" : {
        "transactionId" : "string",
        "system" : "string",
        "target" : "string",
        "user" : "string",
        "password" : "string",
        "requestDate" : "2008-09-28T20:49:45",
        "ipApplication" : "string",
        "traceabilityId" : "string"
      },
      "documentTrace" : req.documentTraza,
      "dataTrace" : req.dataTraza,
      "medioumTrace" : req.medioTraza,
      "cvcTrace" : req.cvcTraza,
      "descriptionTrace" : req.descriptionTraza,
      "flowTrace" : req.flowTraza,
      "valueTrace": String(req.valueTraza).replace('\'',''),
      "applicationTrace" : req.applicationTraza,
      "userCreate" : req.userCreate
    }
    const util = new Util(this.dialog);
    let parameters = this.custom.GetParametersGroup();
    if (parameters?.URLServicios !== undefined) {
      const request = String(parameters.URLServicios.WsCreateOtpTraceability).includes('WsImeiComcel')? req : reqBus;
      this.http.post<ResponseTraceabilityOtp>(
        util.StringFormat(parameters.URLServicios.WsCreateOtpTraceability, 'CreateOtpTraceability'),
        request, httpOptions).subscribe(
          (response: ResponseTraceabilityOtp) => {
            if (!response.isValid) {
              console.log('Error al guardar traza: ' + response.description, false);
            }
          },
          error => console.log('Servicio traceabilityOtp no responde: ', error.message)
        );
    }
  }
}
