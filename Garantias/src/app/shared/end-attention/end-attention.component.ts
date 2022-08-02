import { Component} from '@angular/core';
import { SimpleGlobal } from 'ng2-simple-global';

import { ExternalService } from 'src/app/services/external.service';
import { RequestTraceabilityOtp } from 'src/app/models/traceabilityOtp';
import { TraceabilityOtp } from 'src/app/services/traceabilityOtp.service';
import { delay, tap } from 'rxjs/operators';
import { RequestsEndAttention } from '../../models/requestEndAttention';

declare var $: any


@Component({
  selector: 'app-end-attention',
  templateUrl: './end-attention.component.html'

})
export class EndAttentionComponent {

  public dataHTML: string;
  public showEnd = false;
  public LoadComplete = false;

  public idFlow: string;
  public Min: string;
  public urlReturn: string;
  public showCase: string;
  public Name: string;
  public lastName: string;
  public MailForResponse: string;
  public redirectOutFrame: string;
  public idBI: string;
  public URL: string;
  public GUID: string;
  public context: string;
  public enviroment: string;
  public documentType: string;
  public documentNumber: string;
  public idTurn: string;
  public idUser: string;
  public biHeaderId: string;
  public channelTypeCode: string;
  public accountCode: string;



  private traceability = { error: false } as RequestTraceabilityOtp;

  constructor(
      private externalServices: ExternalService,
      private sg: SimpleGlobal,
      private traceabilityWs: TraceabilityOtp
  ) {
    let formData = new FormData();
    formData = this.sg['postCloseAttentionData'];
    this.externalServices.PostCloseAttention(formData)
      .pipe(
        tap(datosBridge => this.setModalForm(datosBridge)),
        delay(200)
      ).subscribe(() => {
        $('#myfrm').submit();
        this.LoadComplete = true
      },error=>{
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'Finalizaratencion - constructor - CloseAttention', error: true, valueTraza: error });
      });
  }

  private setModalForm(requestForm: RequestsEndAttention) {
    this.idFlow = requestForm.idFlow
    this.documentType = requestForm.documentType
    this.documentNumber = requestForm.documentNumber
    this.idTurn = requestForm.idTurn
    this.idUser = requestForm.idUser
    this.Min = requestForm.Min
    this.urlReturn = requestForm.urlReturn
    this.showCase = requestForm.showCase
    this.Name = sessionStorage.getItem('name')
    this.lastName = sessionStorage.getItem('surname') ? sessionStorage.getItem('surname'): sessionStorage.getItem('lastName')
    this.MailForResponse = sessionStorage.getItem('dataEmail')
    this.redirectOutFrame = requestForm.redirectOutFrame
    this.biHeaderId = requestForm.biHeaderId
    this.idBI = requestForm.idBI,
    this.URL = requestForm.URL
    this.GUID = requestForm.GUID
    this.context = requestForm.context
    this.enviroment = requestForm.enviroment
    this.channelTypeCode = requestForm.channelTypeCode;
    this.accountCode = requestForm.accountCode;
  }
}


