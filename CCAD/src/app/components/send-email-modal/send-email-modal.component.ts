import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from 'src/app/services/notification.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Reqtorresmtp, HeaderSMTP, RootObjectSMTP, MessageBox, MessageBox2, Attach } from 'src/app/models/requests-models/reqtorresmtp';
import { RequestSystemData } from 'src/app/models/requests-models/requestsystemdata';
import { PlatformLocation, DOCUMENT } from '@angular/common';
import { SimpleGlobal } from 'ng2-simple-global';
import { CrmUtilService } from 'src/app/services/CrmUtil.service';
import { WsImeiToolsService } from 'src/app/services/wsimeitools.service';
import { fileRequest } from 'src/app/models/response-model/responseluhn';
import { ResponseParameter } from 'src/app/models/response-model/ResponseParameter';
import { RequestParameter } from 'src/app/models/requests-models/resquestParameter';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import htmlToPdfmake from "html-to-pdfmake"
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Component({
  selector: 'app-send-email-modal',
  templateUrl: './send-email-modal.component.html',
  styleUrls: ['./send-email-modal.component.css']
})

export class SendEmailModalComponent implements OnInit {

  pdfBase64 = '';
  textDownload = 'Generando documento...';
  buttonText = 'Espere un momento...';
  generated = false;
  email = '';
  errorText = '';
  emailValid = false;
  loading = true;
  requestSystemData = new RequestSystemData();
  boolFileSaved: boolean;
  urlFileDocument: string;
  body;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
              private notificationService: NotificationService,
              private sg: SimpleGlobal,
              private sendEmailModal: MatDialogRef<SendEmailModalComponent>,
              @Inject(DOCUMENT) private document: Document,
              private dataParametroService: CrmUtilService,
              private crmUtilService: CrmUtilService,
              private platformLocation: PlatformLocation,
              private snackBar: MatSnackBar,
              private wsImeiTools?: WsImeiToolsService) { }

  ngOnInit(): void {
    this.boolFileSaved = false;
    this.urlFileDocument = '';
    this.setEmailBody();
  }

  // Método que se encarga de generar el Base64 del PDF que se debe enviar por correo
  private Base64Pdf():void {
    //let idTemplate = this.data.idTemplate;
    //let dataParams = this.data.data;
    //if (idTemplate > 0) {
    //  const requestObj = { Id: idTemplate };
    //  this.wsImeiTools.getTemplateById(requestObj)
    //    .subscribe((resp) => {
    //      if (resp.isValid) {
    //        // Valida que exista una plantilla en la BD.
    //        if (resp.message !== '[]') {
    //          const dataJson = JSON.parse(resp.message);
    //          let template = Array.isArray(dataJson) ? dataJson[0] : dataJson;
//
    //          let textToPrint = template.BodyDoc;
    //          let valuesToReplace = template?.BodyDoc?.match(/\{{(.{1,}?)\}}/g);
    //          const length = valuesToReplace.length;
    //          // Itera cada una de las propiedades de la plantilla.
    //          for (let i = 0; i < length; i++) {
    //            // Quita las llaves {{}} de la propiedad.
    //            const valToRep = valuesToReplace[i].replace(/{|}/g, '').trim();
    //            // Verifica si en los datos recibidos existe la propiedad a reemplazar.
    //            if (dataParams[valToRep] || dataParams.hasOwnProperty(valToRep)) {
    //              textToPrint = textToPrint.replace(new RegExp(`{{${valToRep}}}`), dataParams[valToRep]);
    //            }
    //          }
//
    //          pdfMake.fonts = {
    //            Roboto: {
    //              normal: 'Roboto-Regular.ttf',
    //              bold: 'Roboto-Medium.ttf',
    //              italics: 'Roboto-Italic.ttf',
    //              bolditalics: 'Roboto-MediumItalic.ttf'
    //            },
    //            GnuMICR: {
    //              normal: 'GnuMICR_b64',
    //              bold: 'GnuMICR_b64',
    //              italics: 'GnuMICR_b64',
    //              bolditalics: 'GnuMICR_b64'
    //            },
    //            Arial: {
    //              normal: 'Roboto-Regular.ttf',
    //              bold: 'Roboto-Medium.ttf',
    //              italics: 'Roboto-Medium.ttf',
    //              bolditalics: 'Roboto-Medium.ttf'
    //            },
    //            Calibri: {
    //              normal: 'Roboto-Regular.ttf',
    //              bold: 'Roboto-Medium.ttf',
    //              italics: 'Roboto-Medium.ttf',
    //              bolditalics: 'Roboto-Medium.ttf'
    //            },
    //          }
//
//
    //          var data;
    //          var html = htmlToPdfmake(textToPrint);
    //          const documentDefinition = { content: html };
    //          pdfMake.createPdf(documentDefinition).getBase64(function (encodedString) {
    //            data = encodedString;
                this.textDownload = 'Certificado de cuenta al día.pdf';
                this.generated = true;
                this.pdfBase64 = this.data;
                this.buttonText = 'Enviar correo';
                this.loading = false;
    //          }.bind(this));
//
    //        } else {
    //          console.log('Plantilla no existe');
    //        }
    //      } else {
    //        console.error(resp.message);
    //      }
    //    });
    //}
  }

  // Método que se encarga de realizar la validación del campo correo.
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

  /** Método que se encarga de hacer un llamado al servicio para enviar el correo electrónico. */
  public onSendEmail():void {
    if (this.validateEmailField()) {
      //this.sendMail();
      this.SaveFileBase64(this.pdfBase64); 
    }
  }
  //Método que se encarga de la definicion del request para el envío del correo.
  private setEmailBody(): void {
    let responseParameter: ResponseParameter;
    const data = new RequestParameter();
    data.name = 'HEADERNOTIFICATION';
    this.dataParametroService.postParameter(data).subscribe(param => responseParameter = param,
      () => { console.log('Servicio Parametros no responde'); },
      () => {
        const params = JSON.parse(responseParameter.VALUE_PARAMETER);
        this.body = {} as Reqtorresmtp;
        let header = {} as HeaderSMTP;
        let rootObj = {} as RootObjectSMTP;
        const mensajeUno = {} as MessageBox;
        let mensajeDos = {} as MessageBox2;
        mensajeDos = params.mensajeDos;
        mensajeDos.customerBox = '{{@email}}';
        mensajeUno.messageChannel = params.messageChannelSMTP;
        mensajeUno.messageBox = [mensajeDos];
        header = params.header;
        rootObj = params.rootObj;
        rootObj.profileId =  params.profileIdSMTP ;
        rootObj.messageBox = [mensajeUno];
        rootObj.messageContent = 'Señor usuario. Al dar clic en la siguiente URL podra ver el certificado generado. {{@urlFileDocument}}';
        rootObj.subject = 'Certificación Cuenta al día';
        rootObj.profileId = ['SMTP_FS_TCRM1', 'SMS_FS_TCRM1'];
        this.body.headerRequest = header;
        this.body.message = JSON.stringify(rootObj);
        this.Base64Pdf();
      });
  }

  // Método que guarda la información para ir a preferencias de notificación.
  guardarInfo(notificationType: string) {
    this.requestSystemData.functionality = 'CUENTASALDIA';
    this.requestSystemData.process = 'PREFERENCIASNOTIFICACION_CUE';
    this.requestSystemData.guid = this.sg['guid'];
    this.requestSystemData.data = '"origin": "' + (this.platformLocation as any).location.origin + '",';
    this.requestSystemData.data += '"pathname": "' + (this.platformLocation as any).location.pathname + '",';
    this.requestSystemData.data += '"notification": "' + notificationType + '",';
    return this.dataParametroService.saveStepUnSub(this.requestSystemData)
               .subscribe(resp => {
                 this.document.location.href = this.sg['URL_PREFERENCIAS_NOTIFICACION'];
               });
  }

  //Método que muestra un snackbar con un tiempo de duración determinado.
  showSnackbar = (text) => this.snackBar.open(text, 'Ok', { duration: 5000 });

  //Método que consulta el servicio que se encarga de retornar la URL con el certificada enviandole el Base 64.
  private SaveFileBase64(file: any): void{

    this.body.message = this.body.message.toString().replace("{{@email}}", this.email);
    let fileRq = new fileRequest();
    fileRq.headerRequest = {
      transactionId: "string",
      system: "string",
      target: "string",
      user: sessionStorage.getItem('idUser'),
      password: "string",
      requestDate: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
      ipApplication: "string",
      traceabilityId: "string",
    },
    fileRq.file = file.replace('data:application/pdf;filename=generated.pdf;base64,', '');
    this.wsImeiTools.PostSaveFile(fileRq).subscribe(responseFiles =>{
      if(responseFiles.isValid){
        this.urlFileDocument = responseFiles.message;
        this.body.message = this.body.message.toString().replace("{{@urlFileDocument}}", this.urlFileDocument);
        this.loading = true;
        this.buttonText = 'Enviando...';
        this.notificationService.putSendNotificationEmail(this.body)
          .subscribe((resp: any) => {
            this.loading = false;
            this.buttonText = 'Enviar nuevamente';
            if (resp.isValid) {
              if (this.sg['REDIRECCIONAR_NOTIFICACION'] === true) {
                this.showSnackbar('El correo fue enviado correctamente.');
                this.guardarInfo('email');
              } else {
                this.showSnackbar('El correo fue enviado correctamente.');
                this.sendEmailModal.close('OK');
              }
              //this.crmUtilService.showModal('Envío exitoso.', true);
            }
          });
      }
    });
  }
}
