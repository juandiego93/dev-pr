import { Component, OnInit, Optional } from '@angular/core';
import { SimpleGlobal } from 'ng2-simple-global';

import { WsImeiToolsService } from 'src/app/services/wsimeitools.service';
import { CrmUtilService } from 'src/app/services/CrmUtil.service';

import { RequestParameter } from 'src/app/models/requests-models/resquestParameter';
import { RequestDataValidation } from 'src/app/models/requests-models/RequestDataValidation';
import { ResponsegetInfoClientItem } from 'src/app/models/response-model/responsegetInfoClient';

@Component({
  selector: 'app-send-notification',
  template: ``
})

export class SendNotificationComponent implements OnInit {

  docType = '';
  documentNumber = '';
  requestParameter = new RequestParameter();
  requestDataValidation = new RequestDataValidation();
  responseInfoClienteItem: ResponsegetInfoClientItem;

  constructor(@Optional() private wsImeiTools?: WsImeiToolsService,
              @Optional() private sg?: SimpleGlobal,
              @Optional() private crmUtilService?: CrmUtilService) { }

  ngOnInit() { }

  getNotificationPreferences() {
    this.docType = window.sessionStorage.getItem('documentType');
    this.documentNumber = window.sessionStorage.getItem('documentNumber');
    this.wsImeiTools.queryCim(this.docType, this.documentNumber)
        .subscribe(responseConsultaCim => {
          if (responseConsultaCim.isValid === true) {
            this.responseInfoClienteItem = JSON.parse(responseConsultaCim.message);
            const year = this.responseInfoClienteItem.lastModified.substring(0, 4);
            const month = this.responseInfoClienteItem.lastModified.substring(5, 7);
            const day = this.responseInfoClienteItem.lastModified.substring(8, 10);
            const date = day + '/' + month + '/' + year;
            // Consultamos la informacion del cliente para determinar si tiene o no preferencias de notificacion.
            this.requestDataValidation.LastModified = date + ' 12:00:00 a. m.';  //'15/05/2015 12:00:00 a. m.'
            this.crmUtilService.dataValidation(this.requestDataValidation).subscribe(
              dataResponseDataValidation => {
                if (dataResponseDataValidation.ResultBool === true) {
                  this.sg['URL_PREFERENCIAS_NOTIFICACION'] = this.sg['Servicios'].CustomerNotification.replace('{0}', this.sg['guid']);
                  this.sg['REDIRECCIONAR_NOTIFICACION'] = true;
                }
                else {
                  this.sg['REDIRECCIONAR_NOTIFICACION'] = false;
                }
              }
            ); // Data Validation
        } else { // CIM sin data
          this.sg['REDIRECCIONAR_NOTIFICACION'] = false;
        }
      }
    ); //Consulta CIm
  }
}
