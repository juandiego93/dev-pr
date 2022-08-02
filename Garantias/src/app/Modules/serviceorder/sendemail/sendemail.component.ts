import { Attach, HeaderSMTP, MessageBox, MessageBox2, RequestNotificationSMTP, RootObjectSMTP } from './../../../models/notification';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fileRequest } from 'src/app/models/generic';
import { ExternalService } from 'src/app/services/external.service';
import { ImeiToolsService } from 'src/app/services/imeitools.service';
import { CustomService } from 'src/app/services/custom.service';
import { Parameter } from 'src/app/models/parameter';
import { Util } from 'src/app/shared/util';
import { InformativeModalComponent } from 'src/app/shared/informative-modal/informative-modal.component';


@Component({
  selector: 'app-sendemail',
  templateUrl: './sendemail.component.html',
  styleUrls: ['./sendemail.component.scss']
})
export class SendemailComponent implements OnInit {

  public textDownload = 'Generando documento...';

  public generated = false;
  public loading = true;
  public buttonText = 'Espere un momento...';
  public email = '';
  public errorText = '';
  public emailValid = false;
  private pdfBase64 = '';
  private emailSubject = '';
  private urlFileDocument: string;
  private parameters: Parameter
  private util = new Util(this.dialog);
  boolFileSaved: boolean;
  constructor(@Inject(MAT_DIALOG_DATA) public data,
              private imeiTools: ImeiToolsService,
              private externalService: ExternalService,
              private custom: CustomService,
              private dialog: MatDialog,
              public dialogRef: MatDialogRef<SendemailComponent>,

  ) { }
  ngOnInit(): void {
    this.parameters = this.custom.GetParametersGroup();
    this.boolFileSaved = false;
    this.urlFileDocument = '';
    this.emailSubject = this.parameters.NOTIFICATIONVALUES.subject + ' ' + sessionStorage.getItem('idOds');

    // La siguiente línea crea un método de escucha que obtiene el valor del iFrame que genera el PDF en Base64.
    window.addEventListener('message', value => {
      if (!value.data.isDataManual) {
        this.textDownload = sessionStorage.getItem('idOds')+'.pdf';
        this.generated = true;
        this.pdfBase64 = value.data;
        this.buttonText = 'Enviar correo';
        this.loading = false;
      }
    });
  }

   /** Método que se encarga de hacer un llamado al servicio para enviar el correo electrónico. */
   public sendEmail(): void {
    if (this.validateEmailField()) {
      this.SaveFileBase64(this.pdfBase64);
    }
  }

  public validateEmailField(): boolean {
    const field = document.getElementById('email-field');
    if (this.email === '') {
      field.focus();
      this.errorText = 'El campo correo es obligatorio.';
      this.emailValid = false;
      return false;
    }

    if (this.email.length < 10) {
      field.focus();
      this.errorText = 'La longitud del correo debe ser mayor a 10 caracteres.';
      this.emailValid = false;
      return false;
    }

    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(this.email)) {
      field.focus();
      this.errorText = 'El formato de correo no es válido. Ej: ejemplo@correo.com';
      this.emailValid = false;
      return false;
    }

    this.emailValid = true;
    this.errorText = '';
    return true;
  }
  private SaveFileBase64(file: any): void{
    let fileRq = new fileRequest();
    try {
      fileRq.headerRequest = {
        transactionId: 'string',
        system: 'string',
        target: 'string',
        user: sessionStorage.getItem('idUser'),
        password: 'string',
        requestDate: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
        ipApplication: 'string',
        traceabilityId: 'string',
      };
      fileRq.file = file.replace('data:application/pdf;filename=generated.pdf;base64,', '');
      this.imeiTools.PostSaveFile(fileRq).subscribe(responseFiles =>{
        if(responseFiles.isValid){
          this.urlFileDocument = responseFiles.message;
          this.loading = true;
          this.buttonText = 'Enviando...';
          this.externalService.putSendNotificationEmail(this.setEmailBody())
            .subscribe((resp: any) => {
              this.loading = false;
              this.buttonText = 'Enviar nuevamente';
              if (Boolean(resp.isValid)) {
                const dialogInfo = this.dialog.open(InformativeModalComponent, {
                  disableClose: true,
                  data: 'Envío Exitoso',
                  id: 'success-alert',
                });
                dialogInfo.afterClosed().subscribe(d=>{
                  if (d) {
                  this.dialogRef.close(true);
                  }
                });
              } else {
                // logica para envio incorrecto
                this.util.OpenAlert('Envío Fallido', false);
              }
            },error=>{
              this.util.OpenAlert('Envío Fallido - El servicio esta presentando fallas', false);
              this.loading = false;
            });
        } else {
          this.util.OpenAlert(`Envío Fallido: ${responseFiles.message}`, false);
        }
      });
    } catch (error) {
      this.util.OpenAlert('Envío Fallido', false);
    }
  }

  private setEmailBody() {
    const currentDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();

    const body = {} as RequestNotificationSMTP;
    let header = {} as HeaderSMTP;
    const rootObj = {} as RootObjectSMTP;
    const messageOne = {} as MessageBox;
    const messageTwo = {} as MessageBox2;
    const attach = {} as Attach;
    header  = this.parameters.NOTIFICATIONVALUES.HeaderSMTP;
    header.requestDate = currentDate;

    rootObj.pushType = this.parameters.NOTIFICATIONVALUES.pushType;
    rootObj.typeCostumer = this.parameters.NOTIFICATIONVALUES.typeCostumer;
    rootObj.messageBox = [messageOne];
    rootObj.profileId = [this.parameters.NOTIFICATIONVALUES.profileIdvalue1, this.parameters.NOTIFICATIONVALUES.profileIdvalue2];
    rootObj.communicationType = [this.parameters.NOTIFICATIONVALUES.communicationType];
    rootObj.communicationOrigin = this.parameters.NOTIFICATIONVALUES.communicationOrigin;
    rootObj.deliveryReceipts = this.parameters.NOTIFICATIONVALUES.deliveryReceipts;
    rootObj.contentType = this.parameters.NOTIFICATIONVALUES.contentType;
    rootObj.messageContent = this.parameters.NOTIFICATIONVALUES.messageContent;
    rootObj.attach = [attach];
    rootObj.idMessage = this.parameters.NOTIFICATIONVALUES.idMessage;
    // rootObj.subject = this.parameters.NOTIFICATIONVALUES.subject;
    rootObj.subject = this.emailSubject;

    messageOne.messageChannel = this.parameters.NOTIFICATIONVALUES.messageChannel;
    messageOne.messageBox = [messageTwo];

    // attach.name = this.parameters.NOTIFICATIONVALUES.attachName;
    attach.name = sessionStorage.getItem('idOds')+'.pdf';
    attach.type = this.parameters.NOTIFICATIONVALUES.attachType;

    attach.content = this.urlFileDocument;

    messageTwo.customerId = this.parameters.NOTIFICATIONVALUES.customerId;
    messageTwo.customerBox = this.email;

    body.headerRequest = header;
    body.message = JSON.stringify(rootObj);

    return body;
  }


}
