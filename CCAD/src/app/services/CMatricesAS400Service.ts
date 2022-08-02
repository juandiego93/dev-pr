import { ResponseConsultaDire } from './../models/response-model/responseConsultaDire';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestConsultaDireGeneral } from '../models/requests-models/RequestConsultaDireGeneral';
import { ResponseConsultaDireGeneral } from '../models/response-model/ResponseConsultaDireGeneral';
import { environment } from 'src/environments/environment';
import { RequestConsultaDirec } from '../models/requests-models/requestConsultaDirec';
import { SimpleGlobal } from 'ng2-simple-global';
import { CommonParameterClassServices } from './commonparameterclassservices.service';



@Injectable({
  providedIn: 'root'
})
export class CMatricesAS400Service {

  private readonly controllerDireccionG = 'consultaDireccionGeneral';
  private readonly controllerDireccion = 'consultaDireccion';

  constructor(private http: HttpClient,
              private sg: SimpleGlobal,
              private common: CommonParameterClassServices) { }


  putConsultaDireccionGeneral(data: RequestConsultaDireGeneral): Observable<ResponseConsultaDireGeneral> {

    return this.http.put<ResponseConsultaDireGeneral>(this.common.StringFormat(this.sg['Servicios'].Address,
           this.controllerDireccionG, 'put', environment.header), data,
           { headers: { 'Content-Type': 'application/json' }});
  }

  putconsultaDireccion(data: RequestConsultaDirec): Observable<ResponseConsultaDire> {

    return this.http.put<ResponseConsultaDire>(this.common.StringFormat(this.sg['Servicios'].Address,
           this.controllerDireccion, 'put', environment.header), data,
           { headers: { 'Content-Type': 'application/json' }});
  }
}
