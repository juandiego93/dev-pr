import { Observable, of, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestPresencialBizInteraction } from 'src/app/models/requests-models/RequestPresencialBizInteraction';
import { environment } from 'src/environments/environment';
import { SimpleGlobal } from 'ng2-simple-global';
import { ResponseGetBizInteraction } from '../models/response-model/responseGetBizInteraction';
import { CommonParameterClassServices } from './commonparameterclassservices.service';
import { RequestsEndAttention } from '../models/requests-models/requestEndAttention';

@Injectable({
    providedIn: 'root'
})

export class BizInteractionService {

  private readonly controllerPresencialBiz = 'setPresencialBizInteraction';
  private datosBridge: RequestsEndAttention

    constructor(private httpClient: HttpClient,
                private sg: SimpleGlobal,
                private common: CommonParameterClassServices
      ) {
    }

    setPresencialBizInteraction(data: RequestPresencialBizInteraction): Observable<ResponseGetBizInteraction> {
      const userName = sessionStorage.getItem('userName');
      const userLocation = sessionStorage.getItem('userLocation');
      const userNameLocation = sessionStorage.getItem('userNameLocation');
      if (userName || userLocation || userNameLocation) {
        data.mapValues = {
          userName: userName,
          userLocation: userLocation,
          userNameLocation: userNameLocation
        }
      }
        delete data.headerRequestBizInteraction;
        const jsonData = JSON.stringify(data);
        return this.httpClient.put<ResponseGetBizInteraction>(
          this.common.StringFormat(this.sg['Servicios'].BIZInteractions,
                  this.controllerPresencialBiz, jsonData, 'put', environment.header), null,
                  { headers: { 'Content-Type': 'application/json' }});
  }

  public postCloseAttention(formData: FormData): Observable<RequestsEndAttention> {
    try {
      formData.forEach((value, key) => {
        console.log({[key]: value})
        this.datosBridge = { ...this.datosBridge, [key]: value };
      });
      this.datosBridge.URL = this.sg['Servicios'].WsCloseAttention
      this.datosBridge.GUID = this.sg['guid']
      console.log('Datos al micrositio: ', this.datosBridge);
    } catch (error) {
      console.log('Error al cargar Finalizar Atención: ', error);
      throwError(error)
    }
    return of(this.datosBridge)
  }
}

