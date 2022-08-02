import { Component, OnInit, Inject, Input } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CMatricesAS400Service } from 'src/app/services/CMatricesAS400Service';
import { RequestConsultaDireGeneral, Direcciontabulada } from 'src/app/models/requests-models/RequestConsultaDireGeneral';
import { CrmUtilService } from 'src/app/services/CrmUtil.service';
import { WsImeiToolsService } from 'src/app/services/wsimeitools.service';
import { RequestParameter } from 'src/app/models/requests-models/resquestParameter';
import { ResponseParameter } from 'src/app/models/response-model/ResponseParameter';
import { RequestChargesNotification } from 'src/app/models/requests-models/request-chargesnotification';
import { ResponseChargesNotification, DataChargesNotification } from 'src/app/models/response-model/response-chargesnotification';
import { RequestAdminCharges } from 'src/app/models/requests-models/request-admincharges';
import { ResponseAdminCharges, DataAdminCharges } from 'src/app/models/response-model/response-admincharges';
import { RequestConsultaDirec } from 'src/app/models/requests-models/requestConsultaDirec';
import { CertificacionCuentaService } from 'src/app/services/certicacion-cuenta.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RequestSystemData } from 'src/app/models/requests-models/requestsystemdata';
import { ResponseUltimoPaso } from 'src/app/models/response-model/responsesystemdata';
import { SimpleGlobal } from 'ng2-simple-global';
import { DOCUMENT, PlatformLocation } from '@angular/common';
import { CertificadoCuentaComponent } from '../certificado-cuenta/certificado-cuenta.component';
import { CommonParameterClassServices } from 'src/app/services/commonparameterclassservices.service';


@Component({
  selector: 'app-send-residence-modal',
  templateUrl: './send-residence-modal.component.html',
  styleUrls: ['./send-residence-modal.component.scss']
})
export class SendResidenceModalComponent implements OnInit {

  currentAddress = 'Consultando dirección...';
  gotAddress = false;
  newAddress = '';
  currentOption = 'current';
  daneCode = '';
  currentUser = '';
  validated = false;
  loading = false;
  sentCorrectly = false;
  btnText = 'Validar dirección';
  btnSend = 'Enviar';
  isCovered = false;
  dataKnowledge;
  acceptTermCond = false;

  responseParameter: ResponseParameter;
  requestParameter = new RequestParameter();
  requestChargesNotification = new RequestChargesNotification();
  responseChargesNotification: ResponseChargesNotification;
  requestAdminCharges = new RequestAdminCharges();
  responseAdminCharges: ResponseAdminCharges;
  dataAdminCharges: DataAdminCharges;
  dataChargesNotification: DataChargesNotification;
  amount = 0;
  verifyAdminCharges = false;
  chargesNotificationFinishValidation = false;
  chargesNotificationFinishData: string;
  requestSystemData = new RequestSystemData();
  address: string;
  responseUltimoPaso: ResponseUltimoPaso;
  generated = false;
  pdfBase64 = '';

  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private cMatricesAS400Service: CMatricesAS400Service,
    private sendResdModal: MatDialogRef<SendResidenceModalComponent>,
    private common: CommonParameterClassServices,
    private platformLocation: PlatformLocation,
    private dataCrmUtil: CrmUtilService,
    private snackbar: MatSnackBar,
    @Inject(DOCUMENT) private document: Document,
    private crmUtilService: CrmUtilService,
    private certCuentaService: CertificacionCuentaService,
    private dataParametroService: CrmUtilService,
    private wsimeitools: WsImeiToolsService,
    private sg: SimpleGlobal,
  ) { }

  ngOnInit(): void {
    console.log('StateTransaction: ' + this.sg['StateTransaction']);

    this.dataKnowledge = JSON.parse(this.sg['dataknowledgebase']);
    // La siguiente línea crea un método de escucha que obtiene el valor del iFrame que genera el PDF en Base64.
    window.addEventListener('message', value => {
      if (!value.data.isDataManual) {
        this.generated = true;
        this.pdfBase64 = value?.data?.replace('data:application/pdf;filename=generated.pdf;base64,', '');
      }
    });
    if (this.sg['StateTransaction'] === 'OLD') {
      this.ConsultarPasoValidarDireccion();
    } else {
      this.getDirecciónCustom();
    }
  }

  /** Método que hace un llamado al servicio para obtener la dirección basado en el ID. */
  getDirecciónCustom() {
    this.cMatricesAS400Service.putconsultaDireccion(this.data.dirc)
      .subscribe(resp => {
        this.gotAddress = true;
        this.currentAddress = resp?.addresses?.igacAddress;
        this.daneCode = resp?.addresses?.city?.daneCode;
        this.currentUser = window.sessionStorage.getItem('idUser');
      });
  }

  /** Método que hace un llamado al servicio para verificar la obertura de la dirección. */
  validateAddress() {

    this.address = this.currentOption === 'current' ? this.currentAddress : this.newAddress;
    if (this.address) {
      this.loading = true;
      this.btnText = 'Validando dirección...';
      const reqDirGen: RequestConsultaDireGeneral = {
        headerRequest: this.common.returnHeaderAddres(),
        codigoDane: this.daneCode || '11001000',
        direccion: this.address,
        direccionTabulada: new Direcciontabulada()
      };
      this.cMatricesAS400Service.putConsultaDireccionGeneral(reqDirGen)
        .subscribe(resp => {
          if (resp.messageType === 'I' || resp.message === 'Operacion Exitosa' || resp.idCentroPoblado) {
            this.address = resp?.listsAddress[0]?.splitAddres?.direccionTexto;
            this.currentOption === 'current' ? this.currentAddress = this.address : this.newAddress = this.address;
            this.btnText = 'Verificando cobertura';
            const reqDir: RequestConsultaDirec = { headerRequest: this.common.returnHeaderAddres(),idDireccion: resp?.listsAddress[0]?.splitAddres?.idDireccionDetallada };
            this.cMatricesAS400Service.putconsultaDireccion(reqDir)
              .subscribe(dat => {
                // La siguiente línea valida si existe algún nodo con cobertura en la dirección consultada.
                this.validated = dat?.addresses?.listCover?.some(_ => _.state === 'ACT' || _.state === 'A');
                this.isCovered = this.validated;
                this.btnText = 'Validar nuevamente';
                if (this.dataKnowledge && !this.validated) {
                  this.crmUtilService.showModal(this.dataKnowledge?.act31);
                }
                const msg = `La dirección${this.validated ? '' : ' no'} cuenta con cobertura para envío.`;
                this.crmUtilService.showModal(msg, this.validated);
                this.loading = false;
              });
            this.AdminCharges();
          } else {
            this.loading = false;
            this.btnText = 'Validar nuevamente';
            console.error('Respuesta no válida en servicio DireccionGeneral: ', resp.message);
            this.crmUtilService.showModal(this.dataKnowledge?.act31);
            this.crmUtilService.showModal('La dirección no cuenta con cobertura para envío', false);
          }
        });
    } else {
      this.crmUtilService.showModal('Debe ingresar una dirección en el campo.', false);
    }
  }

  /** Método que envía una petición al servicio para guardar un documento PDF en servidor SFTP. */
  sendDocument() {
    if (this.validated) {
      this.btnSend = 'Subiendo documento...';
      this.validated = false;

      // Request necesrio para guardar documento en servidor SFTP.
      const reqUploadDocString = `{'filename':'${this.data?.documentName}','fileContent':'${this.pdfBase64}','idFlow':'142'}`;

      this.certCuentaService.postUploadDocument(reqUploadDocString)
        .subscribe((resp: any) => {
          if (resp?.isValid) {
            this.btnSend = 'Enviar nuevamente';
            this.validated = true;
            this.sentCorrectly = true;
            this.crmUtilService.showModal('Se ha enviado el archivo PDF al servidor correctamente. Documento: ' + this.data?.documentName, true);

            if (this.sg['REDIRECCIONAR_NOTIFICACION'] === true) {
              this.guardarInfo('residence');
            } else {
              this.sendResdModal.close('OK');
            }
          }
        });
    } else {
      this.crmUtilService.showModal('No se posee cobertura en la dirección seleccionada.', false);
    }
  }

  // Método que guarda la información para ir a preferencias de notificación.
  guardarInfo(notificationType: string) {
    this.requestSystemData.functionality = 'CUENTASALDIA';
    this.requestSystemData.process = 'PREFERENCIASNOTIFICACION_CUE';
    this.requestSystemData.guid = this.sg['guid'];
    this.requestSystemData.data = '"origin": "' + (this.platformLocation as any).location.origin + '",';
    this.requestSystemData.data += '"pathname": "' + (this.platformLocation as any).location.pathname + '",';
    this.requestSystemData.data += '"notification": "' + notificationType + '",';
    this.dataParametroService.saveStepUnSub(this.requestSystemData)
      .subscribe(resp => {
        if (this.sg['REDIRECCIONAR_NOTIFICACION'] === true) {
          this.document.location.href = this.sg['URL_PREFERENCIAS_NOTIFICACION'];
        }
      });
  }

  /** Método que muestra una pequeña alerta con un texto enviado por parámetro. */
  showSnackbar = (message) => this.snackbar.open(message, 'Ok', { duration: 5000 });

  /** Evento que se llama al dejar en NO el campo términos y condiciones */
  changeTermCond() {
    if (this.acceptTermCond) {
      this.crmUtilService.showModal(this.dataKnowledge.act46);
    } else {
      this.crmUtilService.showModal(this.dataKnowledge.act42);
    }
  }

  ChargesNotification() {
    this.chargesNotificationFinishValidation = true;
    this.requestParameter.name = 'ChargesNotificationRequest';
    this.dataCrmUtil.postParameter(this.requestParameter)
      .subscribe(dataAdminChargesRequestParameter => {
        this.responseParameter = dataAdminChargesRequestParameter;
        this.requestChargesNotification = JSON.parse(this.responseParameter.VALUE_PARAMETER);
        this.requestChargesNotification.amount = this.amount.toString();
        this.wsimeitools.chargesnotification(this.requestChargesNotification)
          .subscribe(
            dataChargesNotification => {
              this.responseChargesNotification = dataChargesNotification;
              this.dataChargesNotification = JSON.parse(this.responseChargesNotification.message);
              if (this.dataChargesNotification.responseStatus.status === 'OK') {
                this.chargesNotificationFinishData = 'Se realizó correctamente el cargo a la factura.';
              } else {
                this.chargesNotificationFinishData = 'Se presentó un problema al realizar el cargo a la factura.';
              }
            },
          );
      }
      );
  }

  AdminCharges() {
    console.log('this.data.min: ' + this.data.dirc.min);
    this.requestParameter.name = 'AdminChargesRequest';
    this.dataCrmUtil.postParameter(this.requestParameter)
      .subscribe(dataAdminChargesRequestParameter => {
        this.responseParameter = dataAdminChargesRequestParameter;
        this.requestAdminCharges = JSON.parse(this.responseParameter.VALUE_PARAMETER);
        this.requestAdminCharges.contextAttributes[0].contextValue = (this.data.dirc.min.substr(0, 2) === '57' ? '57' : '') + this.data.dirc.min;
        this.wsimeitools.adminCharges(this.requestAdminCharges)
          .subscribe(
            dataAdminCharges => {
              this.responseAdminCharges = dataAdminCharges;
              if (this.responseAdminCharges.isValid === true) {
                this.responseAdminCharges.message = this.responseAdminCharges.message.replace(/\\/g, '');
                this.responseAdminCharges.message = this.responseAdminCharges.message.replace('"[{', '[{');
                this.responseAdminCharges.message = this.responseAdminCharges.message.replace(']"}', ']}');
                this.dataAdminCharges = JSON.parse(this.responseAdminCharges.message);
                this.amount = 0;
                this.dataAdminCharges?.content[0]?.versions[0]?.productOfferingPrices.forEach(dataAdmCharges => {
                  this.amount += dataAdmCharges.versions[0].price.amount;
                });
              }
              this.verifyAdminCharges = true;
              if (this.sg['StateTransaction'] !== 'OLD') {
                this.RegistrarPasoValidacionInicial();
              }
            },
          );
      }
      );
  }

  OnChargesNotification() {
    this.ChargesNotification();
  }


  RegistrarPasoValidacionInicial() {

    //EN ESTE PUNTO LA VALIDACION ES EXITOSA Y SE DEBE GUARDAR EL PASO CON LA INFORMACION CORRESPONDIENTE.
    this.requestSystemData.functionality = 'CUENTASALDIA';
    this.requestSystemData.process = 'VALIDARDIRECCION';
    this.requestSystemData.guid = this.sg['guid'];
    this.requestSystemData.data = '"amount": "' + this.amount + '",';
    this.requestSystemData.data += '"currentOption": "' + this.currentOption + '",';
    this.requestSystemData.data += '"codigoDane": "' + this.daneCode + '",';
    this.requestSystemData.data += '"address": "' + this.address + '"';

    // ACA DEBEMOS GUARDAR ESTE OBJETO SERIALIZADO COMO PASO.
    this.dataCrmUtil.saveStep(this.requestSystemData)
    this.sg['StateTransaction'] = 'OLD';
  }

  ValidaCampoNulo(data: string) {
    if (data == null || data == undefined) {
      return '';
    } else {
      return data;
    }
  }

  ConsultarPasoValidarDireccion() {
    console.log('Consultar Paso');
    // CONSULTAMOS SI EXISTEN PASOS GUARDADOS
    this.dataCrmUtil.readLastStep()
      .subscribe(
        dataResponsereadLastStep => {
          let tempAddress: string;
          let tempCurrentOption = false;
          this.responseUltimoPaso = dataResponsereadLastStep;
          if (this.responseUltimoPaso.ACTION == 'CUENTASALDIA' && (this.responseUltimoPaso.CONTROLLER == 'VALIDARDIRECCION')) {
            this.responseUltimoPaso.lstData.forEach(dataPasos => {
              switch (dataPasos.NAME_DATA) {
                case 'ADDRESS':
                  if (tempCurrentOption == false) {
                    tempAddress = this.ValidaCampoNulo(dataPasos.VALUE_DATA);
                  }
                  else {
                    if (this.currentOption == 'current') {
                      this.currentAddress = this.ValidaCampoNulo(dataPasos.VALUE_DATA);
                    }
                    else {
                      this.newAddress = this.ValidaCampoNulo(dataPasos.VALUE_DATA);
                    }
                  }
                  break;
                case 'CURRENTOPTION':
                  tempCurrentOption = true;
                  if (this.ValidaCampoNulo(dataPasos.VALUE_DATA) === 'current') {
                    this.currentOption = 'current';
                    this.gotAddress = true;
                    if (tempAddress != undefined) {
                      this.currentAddress = tempAddress;
                    }
                  }
                  else {
                    this.currentOption = 'new';
                    if (tempAddress !== undefined) {
                      this.newAddress = tempAddress;
                    }
                  }
                  break;
                case 'CODIGODANE':
                  this.daneCode = this.ValidaCampoNulo(dataPasos.VALUE_DATA);
                  break;
                case 'AMOUNT':
                  this.amount = Number(this.ValidaCampoNulo(dataPasos.VALUE_DATA));
                  break;
              }
            });
          } else {
            this.getDirecciónCustom();
          }
        },
        () => {
          this.getDirecciónCustom();
          console.log('Error al leer el ultimo paso');
        }
      );
    this.verifyAdminCharges = true;
  }
}
