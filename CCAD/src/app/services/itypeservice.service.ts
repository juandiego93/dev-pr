import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ResponseCitiesByDepartments } from 'src/app/models/response-model/responseidtype';
import { environment } from 'src/environments/environment';
import { SimpleGlobal } from 'ng2-simple-global';
import { CommonParameterClassServices } from './commonparameterclassservices.service';


@Injectable({
  providedIn: 'root'
})
export class IdTypeserviceService {

  private readonly controllerTypeDocument = 'typedocument';

  constructor(private httpClient: HttpClient,
              private sg: SimpleGlobal, private common: CommonParameterClassServices) { }

  getDocumentsInfo(): Observable<ResponseCitiesByDepartments> {
    const url = this.sg['Servicios'] !== undefined ? this.sg['Servicios'].WsImeiTools : JSON.parse(atob(sessionStorage.Servicios)).WsImeiTools;
    return this.httpClient.get<ResponseCitiesByDepartments>(
      this.common.StringFormat(url, this.controllerTypeDocument, '""',
          'Get', environment.header, environment.busV));
  }
}
