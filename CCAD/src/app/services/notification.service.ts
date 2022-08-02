import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Resptorre } from '../models/response-model/resptorre';
import { CommonParameterClassServices } from './commonparameterclassservices.service';
import { SimpleGlobal } from 'ng2-simple-global';

@Injectable({providedIn: 'root'})
export class NotificationService {

  constructor(private http: HttpClient,
              private sg: SimpleGlobal,
              private common: CommonParameterClassServices) { }

  putSendNotificationEmail(emailBody) {
    return this.http.put(this.common.StringFormat(this.sg['Servicios'].Notification,
           'PutMessage', JSON.stringify(emailBody), 'Put', environment.header), emailBody,
           { headers: { 'Content-Type': 'application/json' }});
  }
}
