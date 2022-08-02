// #region Importaciones

// Angular.
import { Component, OnInit, Inject, AfterContentChecked, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TitleCasePipe, DOCUMENT, PlatformLocation } from '@angular/common';
import { HttpHeaders } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Services.
import { BizInteractionService } from 'src/app/services/bizInteractionService';
import { CertificacionCuentaService } from 'src/app/services/certicacion-cuenta.service';
import { CommonParameterClassServices } from 'src/app/services/commonparameterclassservices.service';
import { CrmUtilService } from 'src/app/services/CrmUtil.service';
import { IdTypeserviceService } from 'src/app/services/itypeservice.service';
import { WsImeiToolsService } from './../../services/wsimeitools.service';
import { KnowledgeBaseLibService } from 'knowledge-base-lib';

// Components.
import { DynamicDocAccountCertification } from 'src/app/models/requests-models/request-dynamc-doc-cert-cuenta';
import { CertificadoCuentaModalComponent } from './certificado-cuenta-modal.component';
import { SendEmailModalComponent } from '../send-email-modal/send-email-modal.component';
import { SendResidenceModalComponent } from '../send-residence-modal/send-residence-modal.component';
import { FinalizaratencionComponent } from '../finalizar-atencion/finalizar-atencion.component';
import { DecisionTableModalComponent } from 'src/app/shared/components/decision-table-modal/decision-table-modal.component';
import { ModalInformativoComponent } from 'src/app/shared/components/modal-informativo/modal-informativo.component';

// Request models.
import { HeaderRequestInventario } from 'src/app/models/requests-models/requestinventario';
import { RequestBillingPayments } from 'src/app/models/requests-models/RequestBillingPayments';
import { RequestCertificadoCuenta } from 'src/app/models/requests-models/request-certificado-cuenta';
import { RequestConsultaDirec } from 'src/app/models/requests-models/requestConsultaDirec';
import { RequestConsultarCuentas } from 'src/app/models/requests-models/RequestConsultarCuentas';
import { RequestCuentaDiaMovil } from 'src/app/models/requests-models/RequestCuentaDiaMovil';
import { RequestCustomerTransaction } from 'src/app/models/requests-models/requestcustomertransaction';
import { RequestCustomerValid } from 'src/app/models/requests-models/RequestCustomerValid';
import { RequestFinanciacionUnificada } from 'src/app/models/requests-models/RequestFinanciacionUnificada';
import { PaymentPCLMProperties, PaymentsProperties, RequestFinancingIntegrator, WsPaymentsEnquirity,WsPostSale } from './../../models/requests-models/request-financing';
import { RequestFinancingsSearch, HeaderrequestFS } from 'src/app/models/requests-models/RequestFinancingsSearch';
import { RequestGetTreeRestructuring } from 'src/app/models/requests-models/requestgettreerestructuring';
import { RequestParameter } from 'src/app/models/requests-models/resquestParameter';
import { RequestPresencialBizInteraction, HeaderRequestBizInteraction } from 'src/app/models/requests-models/RequestPresencialBizInteraction';
import { RequestSystemData } from 'src/app/models/requests-models/requestsystemdata';

// Response models.
import { ResponseCertificadoCuenta } from 'src/app/models/response-model/response-certificado-cuenta';
import { ResponseConsultarCuentas } from 'src/app/models/response-model/ResponseConsultarCuentas';
import { ResponseFinancingIntegrator, MessageConsultaF } from 'src/app/models/response-model/response-financing';
import { ResponseFinanciacionUnificada } from 'src/app/models/response-model/ResponseFinanciacionUnificada';
import { ResponseGetBizInteraction } from 'src/app/models/response-model/responseGetBizInteraction';
import { ResponsegetInfoClientItem } from 'src/app/models/response-model/responsegetInfoClient';
import { ResponseGetTreeRestructuring, ResponseMessageGetTreeRestructuring } from 'src/app/models/response-model/responsegettreerestructuring';
import { ResponseMessageCtaDiaMovil } from 'src/app/models/response-model/ResponseCuentaDiaMovil';
import { ResponseParameter } from 'src/app/models/response-model/ResponseParameter';
import { LstData, ResponseUltimoPaso } from 'src/app/models/response-model/responsesystemdata';
import { ModelResponseBillingPayment } from 'src/app/models/response-model/ResponseBillingPayments';
import { ResponseNotification } from 'src/app/models/response-model/response-notification';

// Others.
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { SimpleGlobal } from 'ng2-simple-global';
import { RequestDataValidation } from 'src/app/models/requests-models/RequestDataValidation';
import { CMatricesAS400Service } from 'src/app/services/CMatricesAS400Service';
import { CertificationData, Step} from 'src/app/models/certificationdata'
import { DataTransform, WsSoapService } from 'ws-soap-lib';

//#endregion Importaciones


declare var $: any;

@Component({
  selector: 'app-certificado-cuenta',
  templateUrl: './certificado-cuenta.component.html',
  styleUrls: ['./certificado-cuenta.component.css']
})


export class CertificadoCuentaComponent implements OnInit, OnDestroy, AfterContentChecked {

  // #region Declaración de variables.

  private request = new RequestPresencialBizInteraction();
  private headerRequest: HeaderRequestInventario;
  private accountCertification = new ResponseCertificadoCuenta();
  private responseCtaMovil = new ResponseMessageCtaDiaMovil();
  private responseParameter: ResponseParameter;
  private requestParameter = new RequestParameter();
  private requestCustomerTransaction = new RequestCustomerTransaction();
  private responseInfoClienteItem: ResponsegetInfoClientItem;
  private requestSystemData = new RequestSystemData();
  private responseBI: ResponseGetBizInteraction;
  private requestFinancingI = new RequestFinancingIntegrator();
  private responseFinancingI = new ResponseFinancingIntegrator();
  private messageFnancingI: MessageConsultaF;
  private requestDataValidation = new RequestDataValidation();
  private responseUltimoPaso: ResponseUltimoPaso;
  private responseLastStep: ResponseUltimoPaso;
  private paymentParam : PaymentsProperties;
  private wsPayMentEnquirity : WsPaymentsEnquirity;
  private payRRParam : PaymentPCLMProperties;
  private wsPayCLMRR : WsPaymentsEnquirity;
  private wsPostSale :WsPostSale;
  private stepCAD = new Step();
  private StateTransaction: string;
  private dateFactIsOk = false;
  private sessionStorageLoaded = false;
  private dataTurn: { 'AP_CR_TURNOS' };
  private lastPaymentDate = '';
  private lastBilledDate = '';
  private currentBalance = '';
  private varHeaderRequest = {
    idBusinessTransaction: '234321',
    idApplication: '54321234',
    target: 'target',
    startDate: '2019-03-19T12:38:31.643-05:00',
    channel: 'USSD'
  };
  private paymentReferenceOfPendingBilling : any;
  // Generacion Certificado Cuenta al Dia.
  private customerAddressStreet;
  private paymentLastDate;
  private paymentLastAmount;
  private idTypeDoc;
  private listJson = [];
  private tipoCertificacion;
  private collectionIndMgmt = [];
  private currentBalanceMgmt = [];
  private accountNumberMgmt = [];
  private paymentReference:any;
  private subscripEquipos;
  private subscriptions;
  private lengthEquipment: number;
  private countEquipment:number;
  //#endregion
  public certificationData = new CertificationData();
  public responseGetTreeRestructuring: ResponseGetTreeRestructuring;
  public responseMessageGetTreeRestructuring: ResponseMessageGetTreeRestructuring;
  public requestGetTreeRestructuring = new RequestGetTreeRestructuring();
  public suscripciones: subscripcion[];
  public equipments = [];
  public errorMessage: string;
  public transactionID: string;
  public accountNumberSubs;
  public amountDebt = 0;
  public step = -1;
  public messageDebt = 'Validando estado de mora del cliente...';
  public dataOk = false;
  public flowOK = false;
  public inDebt = false;
  public showEnd = false;
  public isGenerado = true;

  private externalURLReturnLocal: string;

  constructor(
    private certCuentaService: CertificacionCuentaService,
    private dataParametrosService: CrmUtilService,
    private titleCasePipe: TitleCasePipe,
    private dialog: MatDialog,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private crmUtilService: CrmUtilService,
    private commonParameterClass: CommonParameterClassServices,
    private bizInteractionService: BizInteractionService,
    private sg: SimpleGlobal,
    private dataIdType: IdTypeserviceService,
    @Inject(DOCUMENT) private document: Document,
    private platformLocation: PlatformLocation,
    private CrmUtilServices: CrmUtilService,
    private cMatricesAS400Service: CMatricesAS400Service,
    private wsSoapService: WsSoapService,
    private knowledgeBaseLib: KnowledgeBaseLibService,
    private _router: Router,
    private wsImeiTools: WsImeiToolsService) {
    this.route.queryParams.subscribe(params => {
      this.certificationData.transactionID = params['TransactionID'];
    });
    this.commonParameterClass.NotificationSent().subscribe(r => this.NotificationSent(r));
  }

  ngOnInit(): void {
    this.inDebt = true;
    this.getPostData();
    this.checkDataLocalStorage();
    this.FetchKnowledgeBase('CUENTASALDIA','CERTIFICADOCUENTAALDIA'); // Llamado a Base de Conocimiento.
  }

  ngAfterContentChecked() {
    this.getParamsV360();
  }

  /**
   * Método que elimina los datos del localStorage al destruir el componente.
   */
  ngOnDestroy() {
    const dataName = localStorage.getItem('dataName');
    if (dataName) {
      localStorage.removeItem(dataName);
    }
  }

  private GetHeaders(servicio: string){
    return {
      headers: new HttpHeaders({
       'SOAPAction': `http://www.amx.com/Service/FinancingsSearch/v1.0/${servicio}`,
       'Content-Type': 'text/xml'
     })
    };
  }


  /**
   * Método que hace llamado a la Base de Conocimiento, por funcionalidad y proceso.
   */
  private FetchKnowledgeBase(nameFunctionality: string, nameProcess: string):void{
    const url = this.commonParameterClass.StringFormat(environment.urlCrmUtils, 'KnowledgeBase/GetKnowledgeBaseByFuncProc', 'strNameFunctionality=' + nameFunctionality + '&strNameProcess=' + nameProcess);
    this.knowledgeBaseLib.fetchKnowledgeBase(url,false);
  }



  /**
   * Método que recibe datos por PostMessage.
   */
  getPostData() {
    window.sessionStorage.clear();
    // Método local que cambia el valor de la variable dataOk para activar los botones deshabilitados.
    const enableButtons = val => {
      this.dataOk = val;
    };
    window.onload = () => {
      let mensaje: any;
      function reciber(e) {
        mensaje = e.data;
        // Entra por este condicional si se generó data manualmente y se persisten los datos en el LocalStorage.
        if (e.data.isDataManual) {
          localStorage.setItem('dataName', e.data.dataName);
          localStorage.setItem(e.data.dataName, JSON.stringify(e.data.dataForm));
          enableButtons(true);
        }
        if (typeof mensaje !== 'object' && !this.sessionStorageLoaded) {
          const datosRec = mensaje.split(',');
          for (var i = 0; i < datosRec.length; i++) {
            const valor = datosRec[i].split(':');
            // Valida que el nombre sea menor a 50 caract. para evitar que guarde inf. de Base64 que también se filtra aquí
            if (valor && valor[0] && valor[0].length < 50) {
              window.sessionStorage.setItem(valor[0], valor[1]);
            }
          }
        }
      }
      window.addEventListener('message', reciber);
    };
  }

  /**
   * Consulta en el LocalStorage si existen datos guardados posteriormente
   * para habilitar los botones y persistir los datos en las variables locales.
   */
  checkDataLocalStorage() {
    const dataName = localStorage.getItem('dataName');
    if (dataName) {
      const dataObjString: any = localStorage.getItem(dataName);
      // Ingresa por este if si existe data almacenada.
      if (dataObjString) {
        const dataObj = JSON.parse(dataObjString);
        this.dataOk = true;
      }
    }
  }

  /**
   * Método que obtiene los parámetros procedentes de Vista360
   * y los preserva en variables locales.
   */
  getParamsV360() {
    if (sessionStorage.length > 0 && this.sessionStorageLoaded === false) {
      let dataSession: any;
      this.certificationData.min = window.sessionStorage.getItem('min');
      this.certificationData.biHeaderId = window.sessionStorage.getItem('idHeader');
      const tCanalTemp = window.sessionStorage.getItem('channelTypeCode');
      this.certificationData.channelTypeCode = tCanalTemp ? parseInt(tCanalTemp, 10) : 0;
      this.certificationData.idUser = window.sessionStorage.getItem('idUser');
      this.certificationData.typeDocument = window.sessionStorage.getItem('documentType');
      this.certificationData.numberDocument = window.sessionStorage.getItem('documentNumber');
      this.certificationData.source = window.sessionStorage.getItem('source');
      this.certificationData.idTurn = window.sessionStorage.getItem('idTurn');
      this.certificationData.account = window.sessionStorage.getItem('account');
      this.certificationData.URLReturn = window.sessionStorage.getItem('urlReturn');
      this.certificationData.idAdress = window.sessionStorage.getItem('AddressId');
      this.certificationData.status = window.sessionStorage.getItem('status');
      this.certificationData.ExternalURLReturn = window.sessionStorage.getItem('externalURLReturn') || '';
      this.externalURLReturnLocal = window.sessionStorage.getItem('externalURLReturn') || '';
      dataSession = window.sessionStorage.getItem('type');
      if(dataSession !== undefined){
        this.certificationData.serviceNumber = window.sessionStorage.getItem('type');
      }
      dataSession = window.sessionStorage.getItem('user');
      if(dataSession!== undefined){
        this.certificationData.userClaro = window.sessionStorage.getItem('user');
      }
      dataSession = window.sessionStorage.getItem('name');
      if(dataSession!== undefined){
        this.certificationData.Name = window.sessionStorage.getItem('name');
      }
      dataSession = window.sessionStorage.getItem('surname ');
      if(dataSession!== undefined){
        this.certificationData.Surname = window.sessionStorage.getItem('surname ');
      }
      this.sessionStorageLoaded = true;
      // Evalúa si ya existe la variable global de las Urls de los servicios, sino las consulta.
      if (this.sg['Servicios'] === undefined) {
        this.getUrlsServices();
      } else {
        setTimeout(() => {
          this.FirstValidations(this.platformLocation);
        }, 1000);
      }
    }
  }

  /**
   * Método que consulta las urls de los servicios en caso de que no existan.
   */
  getUrlsServices() {
    this.requestParameter.name = 'URLServicios';
    this.CrmUtilServices.postParameter(this.requestParameter)
      .subscribe(responseParam => {
        this.sg['Servicios'] = JSON.parse(responseParam.VALUE_PARAMETER);
        sessionStorage.Servicios = btoa(responseParam.VALUE_PARAMETER);
        setTimeout(() => {
          this.FirstValidations(this.platformLocation);
        }, 1000);
      });
  }

  /**
   * Método que consulta pasos guardados.
   */
  searchStep() {
    this.crmUtilService.readLastStep(this.certificationData.transactionID)
      .subscribe(
        dataResponsereadLastStep => {
          this.responseUltimoPaso = dataResponsereadLastStep;
          if (this.responseUltimoPaso.ACTION === 'CUENTASALDIA' && (this.responseUltimoPaso.CONTROLLER === 'PREFERENCIASNOTIFICACION_CUE')) {
            this.responseUltimoPaso.lstData.forEach(dataPasos => {
              switch (dataPasos.NAME_DATA) {
                case 'NOTIFICATION': {
                  this.certificationData.typeNotification = this.ValidateNullField(dataPasos.VALUE_DATA);
                  this.sendNotification();
                }
              }
            });
          }
        },
        (error) => console.log('Error al leer el ultimo paso: ', error)
      );
  }

  ValidateNullField(data: string) {
    if (data == null || data === undefined) {
      return '';
    } else {
      return data;
    }
  }

  FirstValidations(platformLocation: PlatformLocation) {
    if (this.certificationData.numberDocument) {
      if (this.certificationData.idTurn === undefined || this.certificationData.idTurn === '') {
        this.certificationData.boolSetPresencial = false;
        this.certificationData.idTurn = '';
      } else {
        this.certificationData.boolSetPresencial = true;
      }
      this.getSerViceId();
    }

    /**
     * Inicio de atención.
     */
    this.dataIdType.getDocumentsInfo()
      .subscribe(
        dataResponseGetDocumentsInfo => {
          this.listJson = JSON.parse(dataResponseGetDocumentsInfo.message);
          this.certificationData.shortDocumentType = this.certificationData.typeDocument;
          if (this.listJson && this.listJson.length > 0) {
            this.idTypeDoc = this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Id;
            this.certificationData.idTypeDoc = this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Id;
            this.certificationData.fullTypeDocument = this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Description;
          }
          this.requestParameter.name = 'FLUJOS_SERVICIOS';

          this.CrmUtilServices.postParameter(this.requestParameter)
            .subscribe(dataResponseParamFlujoServicios => {
              this.certificationData.serviceId = JSON.parse(dataResponseParamFlujoServicios.VALUE_PARAMETER).FLUJOS_SERVICIOS.cuentasaldia;
              this.sg['servicio'] = this.certificationData.serviceId;
              this.flowOK = true;

              // Se crea la transacción para este flujo.
              this.requestCustomerTransaction.idFlow = this.certificationData.serviceId;
              this.requestCustomerTransaction.idTurn = this.certificationData.idTurn;
              this.requestCustomerTransaction.typeDocument = this.certificationData.shortDocumentType;
              this.requestCustomerTransaction.numberDocument = this.certificationData.numberDocument;
              this.CrmUtilServices.postCreateTransaction(this.requestCustomerTransaction)
                .subscribe(dataResponseCrearTransaccion => {
                  this.certificationData.serviceId = dataResponseCrearTransaccion.Guid;
                  this.sg['guid'] = dataResponseCrearTransaccion.Guid;
                  this.certificationData.guid= dataResponseCrearTransaccion.Guid;
                  this.StateTransaction = dataResponseCrearTransaccion.StateTransaction.toUpperCase() ;
                  this.sg['StateTransaction'] = this.StateTransaction;
                  console.log('GUID: ' + dataResponseCrearTransaccion.Guid);
                  console.log('Estado: ' + dataResponseCrearTransaccion.StateTransaction.toUpperCase() );
                  this.certificationData.messages = this.certCuentaService.GetMessages();
                  if (dataResponseCrearTransaccion.StateTransaction.toUpperCase() == 'NEW' ) {
                    this.requestSystemData.functionality = 'CUENTASALDIA';
                    this.requestSystemData.process = 'BEGIN';
                    this.requestSystemData.guid = dataResponseCrearTransaccion.Guid;
                    this.requestSystemData.data = '"URL_RETURN": "' + decodeURIComponent(this.certificationData.URLReturn) + '"';
                    this.crmUtilService.saveStep(this.requestSystemData);
                  } else {
                    if(this.certificationData.source === 'INS') {
                      this.crmUtilService.readLastStep(this.certificationData.guid)
                        .subscribe(
                          responseLast => {
                            this.responseLastStep = responseLast;
                            this.CheckSteps();
                          },
                          error => {
                            this.crmUtilService.showModal('Error al consultar pasos: ' + error.error.message);
                          }
                        );
                    }
                  }


                  // CONSULTAMOS LA INFORMACION DEL CLIENTE PARA DETERMINAR SI TIENE O NO PREFERENCIAS DE NOTIFICACION
                  this.wsImeiTools.queryCim(this.certificationData.idTypeDoc.toString(), this.certificationData.numberDocument)
                    .subscribe(responseConsultaCim => {
                      if (responseConsultaCim.isValid === true) {
                        this.responseInfoClienteItem = JSON.parse(responseConsultaCim.message);
                        const date = moment(this.responseInfoClienteItem.lastModified).format('DD/MM/YYYY');
                        // Consultamos la informacion del cliente para determinar si tiene o no preferencias de notificacion.
                        this.requestDataValidation.LastModified = date + ' 12:00:00 a. m.';
                        this.crmUtilService.dataValidation(this.requestDataValidation).subscribe(
                          dataResponseDataValidation => {
                            if (dataResponseDataValidation.ResultBool == true) {
                              // CONSULTAMOS EL PARAMETRO CON LA URL A DONDE SE DEBE REDIRECCIONAR PARA SELECCIONAR LAS PREFERENCIAS DE NOTIFICACION.
                              this.sg['URL_PREFERENCIAS_NOTIFICACION'] = this.sg['Servicios'].CustomerNotification.replace('{0}', this.sg['guid']);
                              this.sg['REDIRECCIONAR_NOTIFICACION'] = true;

                            } else {
                              this.sg['REDIRECCIONAR_NOTIFICACION'] = false;

                              // Se valida si nunca ha tenido preferencias de notificación.
                              if (String(this.responseInfoClienteItem.doNotEmail) === 'true' && String(this.responseInfoClienteItem.doNotSMSInstantMessaging) === 'true') {
                                this.sg['URL_PREFERENCIAS_NOTIFICACION'] = this.sg['Servicios'].CustomerNotification.replace('{0}', this.sg['guid']);
                                this.sg['REDIRECCIONAR_NOTIFICACION'] = true;
                              }

                              // Notificación: Email
                              if (this.responseInfoClienteItem.doNotEmail === 'false' && this.responseInfoClienteItem.doNotSMSInstantMessaging === 'true') {
                                this.certificationData.notificationMode = 'EMAIL';
                                //this.sg['NOTIFICATION_MODE'] = 'EMAIL';
                              }

                              // Notificación: SMS
                              if (this.responseInfoClienteItem.doNotSMSInstantMessaging === 'false' && this.responseInfoClienteItem.doNotEmail === 'true') {
                                this.certificationData.notificationMode = 'SMS';
                                //this.sg['NOTIFICATION_MODE'] = 'SMS';
                              }

                              // Notificación: SMS (False & False en ambos)
                              if (this.responseInfoClienteItem.doNotEmail === 'false' && this.responseInfoClienteItem.doNotSMSInstantMessaging === 'false') {
                                this.certificationData.notificationMode = 'SMS';
                                //this.sg['NOTIFICATION_MODE'] = 'SMS';
                              }
                            }

                            // Verifica si regresa del micrositio de preferencias.
                            if (this.certificationData.transactionID) {
                              this.searchStep();
                            }

                            // Llamado a método que dispara las consultas luego de tener data base.
                            this.callDataMethods();
                          }
                        ); // Data Validation
                      } else { // CIM sin data
                        this.sg['REDIRECCIONAR_NOTIFICACION'] = false;
                        this.messageDebt = 'Cliente no existe en CIM, por lo tanto no se puede generar el certificado'
                        this.inDebt = true;
                      }
                    }
                    ); //Consulta Cim
                });
            }
            );
        }
      );
  }

  /// Método Inicial: El cual dispara las consultas dependiendo de el source. Es llamado una vez se tiene la data necesaria.
  callDataMethods() {
    this.wsImeiTools.queryCim(this.certificationData.idTypeDoc.toString(), this.certificationData.numberDocument).subscribe(resp => {
      if (resp.isValid) {
        this.responseInfoClienteItem = JSON.parse(resp.message);
        this.certificationData.currentAddress = this.responseInfoClienteItem.principalAddress;
        this.customerAddressStreet = this.certificationData.currentAddress;
        console.log(this.certificationData.currentAddress);
        console.log(this.customerAddressStreet);
        switch (this.certificationData.source) {
          case 'RR': {
            this.GetTreeRestructuring();
            break;
          }
          case 'BSCS': {
            this.GetConsultarCuentasNew();
            break;
          }
          default: {
            this.getPendingBilling();
            break;
          }
        }
      }
    }, (error) => {
      this.disableFields('Error al validar direccion del cliente', error, false);
    });
  }

  sendNotification() {
    const typeNotif  = this.certificationData.typeNotification;
    const notifForm = this.certificationData.notificationMode;
    if (this.responseInfoClienteItem !== undefined) {
      this.crmUtilService.setBodyNotification(typeNotif,
        this.certificationData.min,
        this.responseInfoClienteItem.email,
        notifForm,
        `${this.responseInfoClienteItem.firstName.trim()} ${this.responseInfoClienteItem.firstSurname.trim()}`);
    } else {
      if (this.listJson && this.listJson.length > 0) {
        this.certificationData.idTypeDoc = this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Id;
      } else {
        return this.dataIdType.getDocumentsInfo()
          .subscribe(dataResponseGetDocumentsInfo => {
            this.listJson = JSON.parse(dataResponseGetDocumentsInfo.message);
            // Se llama nuevamente el servicio con los datos ya cargados.
            this.sendNotification();
          });
      }

      this.wsImeiTools.queryCim(this.certificationData.idTypeDoc.toString(), this.certificationData.numberDocument).subscribe(rpInfoCl => {
        if (rpInfoCl.isValid) {
          this.responseInfoClienteItem = JSON.parse(rpInfoCl.message);
          this.crmUtilService.setBodyNotification(typeNotif,
            this.certificationData.min,
            this.responseInfoClienteItem.email,
            notifForm,
            `${this.responseInfoClienteItem.firstName.trim()} ${this.responseInfoClienteItem.firstSurname.trim()}`);
        } else {
          this.crmUtilService.showModal('Error en servicio consulta cliente [CIM]: ' + rpInfoCl.message, false);
        }
      });
    }
  }

  /** Método que consume el servicio para obtener el certificado de cuenta */
  getCertificadoCuenta() {
    if (this.certificationData.min) {
      
      const requestCert: RequestCertificadoCuenta = {
        headerRequest: {
          idBusinessTransaction: '234321',
          idApplication: '54321234',
          target: 'target',
          startDate: new Date().toISOString(),
          channel: this.certificationData.channel || 'USSD'
        },
        subscriberNumber: this.certificationData.min
      };

      console.log("requestCert",requestCert);

      this.certCuentaService.getPaymentReferences(requestCert)
        .subscribe(resp => {
          if (resp.isValid) {
            this.dataOk = true;
            this.accountCertification.data = JSON.parse(resp.message);
            this.accountCertification.data[2].accounts.account.TPR.lastBilledDate?this.lastBilledDate = this.accountCertification.data[2].accounts.account.TPR.lastBilledDate:this.lastBilledDate = '';
            this.amountDebt = Number(this.accountCertification?.data?.[2]?.accounts?.account?.TPR?.currentBalance);
            this.inDebt = this.accountCertification?.data?.[2]?.accounts?.account?.TPR?.SPR?.collectionInd === 'true';

            if (this.inDebt) { // En deuda
              this.disableFields('El cliente tiene un valor pendiente de: ');
            } else {
              // Validación de PBI: 290129. Donde se genera el cert. para las cuentas desac. solamente si el valor deuda es menor o igual a 0.
              if (this.certificationData.status === '0') {
                this.amountDebt = Number(this.accountCertification?.data?.[2]?.accounts?.account?.TPR?.currentBalance);
                this.inDebt = this.amountDebt > 0;
                if (this.inDebt) { // En deuda
                  this.disableFields('El cliente tiene un valor pendiente de: ');
                } else {
                  this.getBillingPayments();
                }
              } else {
                this.getBillingPayments();
              }
            }
          } else {
            const ERRORMSG = 'No se han encontrado datos para generar el certificado de cuenta al día o el servicio retornó una respuesta inválida. (PaymentReferences)';
            this.disableFields(ERRORMSG, null, false);
          }
        });
    } else {
      if(window.sessionStorage.getItem('type') == 'HOGAR' || window.sessionStorage.getItem('type') == 'FIJA'){
        console.error('No se recibió el parámetro "Número de teléfono-Min", por favor validar. ', this.certificationData.min);
      }else{
        console.error('No se recibió el parámetro "Número de teléfono-Min", por favor validar. ', this.certificationData.min);
        this.showSnackbar('No se recibió el parámetro "Número de teléfono-Min", por favor validar.');
      }
    }
  }

  getBillingPayments() {
    const requestBillingPayments: RequestBillingPayments = {
      accountNumber: this.accountCertification?.data?.[2]?.accounts?.account?.number || this.certificationData.account,
      paymentDateFrom: moment().subtract(6, 'months').format('YYYY-MM-DD'),
      paymentDateUntil: moment().format('YYYY-MM-DD'),
      paymentStatus: '3',
      searchLimit: '10',
      headerGetBilling: {
        additionalNode: '',
        idApplication: '54321234',
        target: 'target',
        startDate: new Date().toISOString(),
        channel: this.certificationData.channel || 'USSD',
        idBusinessTransaction: '234321',
        idESBTransaction: '',
        ipApplication: '',
        password: '',
        userApplication: '',
        userSession: ''
      }
    };

    this.wsImeiTools.getBillingPayments(requestBillingPayments)
      .subscribe(resp => {
        try {
          if (resp.isValid) {
            const payment: ModelResponseBillingPayment = JSON.parse(resp.message);
            if(this.paymentReference === this.paymentReferenceOfPendingBilling)
            {
              this.lastPaymentDate = payment?.accounts[0]?.payment?.sort((a, b) => b.date - a.date)[0]?.date;
            }
            this.certificationData.valuePayment = payment?.accounts[0]?.payment[0]?.value || payment?.accounts[0]?.payment[0]?.amount?.Value;
            this.certificationData.valuePayment === undefined  || this.certificationData.valuePayment == 0? this.defaultErrorSoapPayment(): this.certificationData.valuePayment = this.certificationData.valuePayment;
            payment.accounts[0].payment[0].servicesReference.paymentReference?this.paymentReference = payment.accounts[0].payment[0].servicesReference.paymentReference: this.paymentReference ='';
            this.dateFactIsOk = true;
            if(this.certificationData.source == 'INS') {
              this.crmUtilService.showModal(this.certificationData.messages.paramClassFlujos?.find(x=> x.id === 'seleccioneCertificado').text, true);
            }
            this.getFinancingSearch();
          } else {
            console.error('Respuesta isValid: false. Servicio BillingPayments => ', resp.message);
            this.inDebt = true;
            this.messageDebt = 'Señor usuario no es posible generar el certificado ya que no cuenta con fecha de facturación y el monto a pagar es ';
            this.dateFactIsOk = false;
          }
        } catch (error) {
          this.dateFactIsOk = false;
          this.inDebt = true;
          this.messageDebt = 'Señor usuario no es posible generar el certificado ya que no cuenta con fecha de facturación y el monto a pagar es ';
          console.error('Error en el servicio getBillingPayments => ', error);
        }
      }, (error) => {
        console.error('Error en consumo de servicio BillingPayments: ', error);
        this.inDebt = true;
        this.messageDebt = 'Señor usuario no es posible generar el certificado ya que no cuenta con fecha de facturación';
      });
  }

  /** Método que construye el objeto requerido para generar certificado de cuenta. */
  getObjectDynCertCuenta(): DynamicDocAccountCertification {
    console.log('Certificado cuenta proceso normal.');
    moment.locale('es');
    const name = this.accountCertification?.data[1]?.customer?.name + ' ' + this.accountCertification?.data[1]?.customer?.lastname;
    const currentDate = new Date();
    const lastPayment = this.dateFactIsOk && this.lastPaymentDate !== '' ? new Date(this.lastPaymentDate) : new Date();
    const lastBilledDate = this.lastBilledDate !== '' ? new Date(this.lastBilledDate + ' 00:00') : new Date();
    const dynDocCertCuenta: DynamicDocAccountCertification = {
      idTemplate: environment.idTemplateCertCuent,
      data: {
        currentYear: currentDate.getFullYear().toString(),
        billYear: lastBilledDate.getFullYear().toString(),
        payYear: lastPayment.getFullYear().toString(),
        currentDay: currentDate.getDate().toString(),
        billDay: moment(lastBilledDate).format('DD'),
        payDay: moment(lastPayment).format('DD'),
        currentMonth: this.titleCasePipe.transform(moment(currentDate).format('MMMM')),
        billMonth: this.titleCasePipe.transform(moment(lastBilledDate).format('MMMM')),
        payMonth: this.titleCasePipe.transform(moment(lastPayment).format('MMMM')),
        numberId: this.certificationData.numberDocument,
        name: this.certificationData.Name + ' ' + this.certificationData.Surname|| this.titleCasePipe.transform(name),
        addresService: this.certificationData.currentAddress || ' ', //direccion
        typeDocument: this.certificationData.fullTypeDocument, //Tipo de documento
        serviceName: this.certificationData.account,// Nombre del servicio (account)
        serviceNumber: this.certificationData.serviceNumber, // Numero del servicio
        valuePayment: '$ ' + this.certificationData.valuePayment.toLocaleString('es-CO') || ' $ 0',
        user: this.certificationData.userClaro || ' ', // usuario sesion
        consecutive:' '
      }
    };
    this.certificationData.documentName = `CCD-${moment(currentDate).format('YYYYMMDD')}-${dynDocCertCuenta.data.serviceName} - Certificado cuenta al día.pdf`;
    return dynDocCertCuenta;
  }

  /** Método que construye el objeto requerido para generar certificado de cuenta. Operacion Actual */
  getObjectDynCertCuentaActual(): DynamicDocAccountCertification {
    console.log('Certificado Operación Actual');

    // Verifica si existen datos almacenados en LocalStorage anteriormente guardados.
    let name = '';
    const dataName = localStorage.getItem('dataName');
    if (dataName) {
      const dataObjString: any = localStorage.getItem(dataName);
      // Ingresa por este if si existe data almacenada que se ha ingresado manualmente.
      if (dataObjString) {
        this.dataOk = true;
        const dataObj = JSON.parse(dataObjString);
        name = dataObj.nombre;
      }
    }
    moment.locale('es');
    const currentDate = new Date();
    const lastPayment = this.lastPaymentDate !== '' ? new Date(this.lastPaymentDate) : new Date();
    const lastBilledDate = this.lastBilledDate !== '' ? new Date(this.lastBilledDate) : new Date();
    const dynDocCertCuenta: DynamicDocAccountCertification = {
      idTemplate: environment.idTemplateCertCuent,
      data: {
        currentYear: currentDate.getFullYear().toString(),
        billYear: lastBilledDate.getFullYear().toString(),
        payYear: lastPayment.getFullYear().toString(),
        currentDay: currentDate.getDate().toString(),
        billDay: moment(lastBilledDate).format('DD'),
        payDay: moment(lastPayment).format('DD'),
        currentMonth: this.titleCasePipe.transform(moment(currentDate).format('MMMM')),
        billMonth: this.titleCasePipe.transform(moment(lastBilledDate).format('MMMM')),
        payMonth: this.titleCasePipe.transform(moment(lastPayment).format('MMMM')),
        numberId: this.certificationData.numberDocument,
        name: this.certificationData.Name + ' ' + this.certificationData.Surname|| this.titleCasePipe.transform(name),
        addresService: this.certificationData.currentAddress || '', //direccion
        typeDocument: this.certificationData.fullTypeDocument, //Tipo de documento
        serviceName:this.certificationData.account, // Nombre del servicio (account)
        serviceNumber: this.certificationData.serviceNumber, // Numero del servicio
        valuePayment: '$ ' + this.certificationData.valuePayment.toLocaleString('es-CO') || ' $ 0',
        user: this.certificationData.userClaro || ' ',
        consecutive:' '
      }
    };
    this.certificationData.documentName = `CCD-${moment(currentDate).format('YYYYMMDD')}-${(dynDocCertCuenta.data.serviceName || ' ')} - Certificado cuenta al día.pdf`;
    return dynDocCertCuenta;
  }

  /** Método que construye el objeto requerido para generar certificado de cuenta. */
  getObjectDynCertCuentaMovil(): DynamicDocAccountCertification {
    const dataCertMovil: ResponseMessageCtaDiaMovil = this.responseCtaMovil;
    console.log('Certificado cuenta proceso móvil.');
    moment.locale('es');
    const name = this.titleCasePipe.transform(dataCertMovil.NombresApellidos);
    const currentDate = moment();
    const lastPayment = dataCertMovil.FechaUltimoPago ? moment(dataCertMovil.FechaUltimoPago, 'DD/MM/YYYY') : moment();
    const lastBilledDate = dataCertMovil.FechaFacturación ? moment(dataCertMovil.FechaFacturación, 'DD/MM/YYYY') : moment();
    const dynDocCertCuenta: DynamicDocAccountCertification = {
      idTemplate: environment.idTemplateCertCuent,
      data: {
        currentYear: moment(currentDate).format('YYYY'),
        billYear: moment(lastBilledDate).format('YYYY'),
        payYear: moment(lastPayment).format('YYYY'),
        currentDay: moment(currentDate).format('DD'),
        billDay: moment(lastBilledDate).format('DD'),
        payDay: moment(lastPayment).format('DD'),
        currentMonth: this.titleCasePipe.transform(moment(currentDate).format('MMMM')),
        billMonth: this.titleCasePipe.transform(moment(lastBilledDate).format('MMMM')),
        payMonth: this.titleCasePipe.transform(moment(lastPayment).format('MMMM')),
        numberId: dataCertMovil.NumeroIdentificación || this.certificationData.numberDocument,
        name: this.certificationData.Name + ' ' + this.certificationData.Surname|| name,
        addresService: this.certificationData.currentAddress || '',
        typeDocument: this.certificationData.fullTypeDocument,
        serviceName: this.certificationData.account,
        serviceNumber: this.certificationData.serviceNumber,
        valuePayment: '$ ' + this.certificationData.valuePayment.toLocaleString('es-CO') || ' $ 0',
        user: this.certificationData.userClaro || ' ',
        consecutive:' '
      }
    };
    this.certificationData.documentName = `CCD-${moment(currentDate).format('YYYYMMDD')}-${dynDocCertCuenta.data.serviceName} - Certificado cuenta al día.pdf`;
    return dynDocCertCuenta;
  }

  GetTreeRestructuring() {
    let responseParameter: any;
    this.requestParameter.name = 'HeaderGetTreeRestructuring';
    this.CrmUtilServices.postParameter(this.requestParameter)
      .subscribe(
        data => responseParameter = data,
        () => { },
        () => {
          if (responseParameter.VALUE_PARAMETER !== undefined) {

            if (this.certificationData.account) {
              const requestCustVal: RequestCustomerValid = { CUENTARR: this.certificationData.account };
              this.SetRequestGetTreeRestructuring();
            } else {
              const msgErr = 'No existe ninguna cuenta en estado activo que permita generar el certificado.';
              this.disableFields(msgErr, {}, false);
              this.showSnackbar(msgErr);
            }

          } else {
            this.showSnackbar('No se encontró parametro "HeaderGetTreeRestructuring". (Servicio parametros)');
          }
        }
      );
  }

  /**
   * Método para preparar request de consumo para servicio de GetTreeRestructuring (CLCCTAAR0P)
   * @author JHONNATAN OSORIO - 26 Jul 2021
   */
  private SetRequestGetTreeRestructuring(): void {
    const wsSubscriberP = this.sg['ServiciosDAC'].GetTreeRestructuring;

    const dataTransform = {
      arrayData: [
        { name: 'CUENTARR', value: this.certificationData.account },
      ]
    } as DataTransform;

    this.ConsumeGetTreeRestructuring(wsSubscriberP.Url, wsSubscriberP.Xml, dataTransform);
  }


  /**
 * Método para consultar servicios de Suscripciones(GetTreeRestructuring)
 * @author JHONNATAN OSORIO - 26 Jul 2021
 * @param url url servicio SOAP
 * @param xmlString XML de la operación
 * @param data data para modificación del XML
 */
  private ConsumeGetTreeRestructuring(url: string, xmlString: string, data: DataTransform): void {

    this.wsSoapService.getDataXMLTrans(xmlString, data).then((xml) => {

        this.wsSoapService.wsSoap(url, xml).then((jsonResponse) => {
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'ns2:entryResponse').then((responseSoap) => {
                  this.ValidateGetTreeRestructuring(responseSoap);
                }
              );
            } catch (error) {
              const msgErr = 'Error al consultar servicio para consulta de suscripción: ' + error + '. ';
              this.disableFields(msgErr);
            }

          }
        );
      }, (error) => {
        const msgErr = 'Error al consultar servicio para consulta de suscripción: ' + error + '. ';
        this.disableFields(msgErr);
      }
    );
  }

  /**
   * logica y validación de respuesta de servicio de GetTreeRestructuring
   * @author JHONNATAN OSORIO - 26 Jul 2021
   * @param responseSoap respues servicio GetTreeRestructuring
   */
  private ValidateGetTreeRestructuring(responseSoap): void {
    const response = responseSoap[0]['return'][0];
    if (response.MSGERR[0] === 'Consulta Exitosa') {
      this.lastBilledDate = response.FECHAUF[0] !== '' ? moment(response.FECHAUF[0], 'YYYYMMDD').toISOString() : '';
      this.lastPaymentDate = response.FECHAUP[0] !== '' ? moment(response.FECHAUP[0], 'YYYYMMDD').toISOString() : '';
      // Se valida que el cliente no tenga una mora pendiente => Clientes RR.
      // Pendiente traer ultimo pago
      const amountPending = parseInt(response.MORA[0], 10);
      if (isNaN(amountPending) || amountPending > 0) {
        const msgErr = 'El cliente tiene un saldo pendiente de: ';
        this.amountDebt = amountPending;
        this.disableFields(msgErr);
      } else {
        this.GetPCLMRR();
      }
    } else {
      const msgErr = 'Ha ocurrido un error en el servicio (CustomerValid-Clcc) que verifica el estado de cuenta del cliente.';
      this.disableFields(msgErr, response.MSGERR[0], false);
    }

  }


  /**
   * Método que consume el servicio para cuenta al día móvil
   */
  getMovilDayAccount() {
    try {
      const REQUEST: RequestCuentaDiaMovil = {
        headerRequest: {
          transactionId: "string",
          system: "string",
          target: "string",
          user: sessionStorage.getItem('idUser'),
          password: "string",
          requestDate: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
          ipApplication: "string",
          traceabilityId: "string",
        },
        clientDocument: this.certificationData.numberDocument,
        customerAccount: this.certificationData.referenceNumber || this.certificationData.account,
      };

      this.wsImeiTools.postCuentaAlDiaMovil(REQUEST)
        .subscribe(resp => {
          try {
            if (resp.isValid) {
              this.responseCtaMovil = JSON.parse(resp.message);
              console.log("this.responseCtaMovil.FechaUltimoPago",this.responseCtaMovil.FechaUltimoPago)
              if (this.responseCtaMovil.FechaUltimoPago === '' ||
                this.responseCtaMovil.FechaUltimoPago === ' ' ||
                this.responseCtaMovil.FechaUltimoPago === null) {
                this.inDebt = true;
                this.messageDebt = 'Señor usuario no es posible generar el certificado ya que no cuenta con fecha de pago.'
                return;
              } else {
                this.dataOk = true;
                this.inDebt = false;
                // Se llama al método de llamado al servicio PaymentReferences para la validación de cuentas desactivadas.
                if (this.certificationData.status === '0' && this.certificationData.source === 'INS') {
                  this.GetPaymentReferences();
                }
              }
            } else {
              const ERRORMSG = `La consulta no retornó datos para el cliente: Cuenta: ${this.certificationData.account}, Doc: ${this.certificationData.numberDocument}.`;
              this.disableFields(ERRORMSG, resp.message);
            }
          } catch (error) {
            const ERRORMSG = 'Error en llamado a servicio CuentaDiaMovil';
            this.disableFields(ERRORMSG, error);
          }
        });
    } catch (error) {
      const ERRORMSG = 'Error en método de llamado del servicio CuentaDiaMovil =>';
      this.disableFields(ERRORMSG, error);
    }
  }

  /** Método que obtiene la URL con el objeto codificado en base64. */
  getUrlDynamicDoc(): string {
    let objBase64;
    if (this.certificationData.source === 'BSCS') {
      objBase64 = btoa(JSON.stringify(this.getObjectDynCertCuentaMovil()));
    } else if (this.certificationData.source === 'RR') {
      objBase64 = btoa(JSON.stringify(this.getObjectDynCertCuentaActual()));
    } else {
      objBase64 = btoa(JSON.stringify(this.getObjectDynCertCuenta()));
    }
    return `${this.sg['Servicios'].DynamicDoc}?data=${objBase64}`;
  }

    /** Método que obtiene la URL con el objeto codificado en base64. */
    getUrlDynamicDocNew(data): string {
      let objBase64;
      objBase64 = btoa(JSON.stringify(data));
      return `${this.sg['Servicios'].DynamicDoc}?data=${objBase64}`;
    }


  /** Método que cifra el objeto en Base64 para enviarlo por URL como parámetros
   * y abriéndola en una nueva pestaña.
   */
  goToDynamicDocument() {
    this.dialog.open(CertificadoCuentaModalComponent, {
      id: 'dialogCert',
      width: '90%',
      height: '90%',
      disableClose: true,
      data: this.getUrlDynamicDoc()
    });
  }

    /** Método que cifra el objeto en Base64 para enviarlo por URL como parámetros
   * y abriéndola en una nueva pestaña.
   */
     goToDynamicDocumentByData() {
       console.log(this.getUrlDynamicDocNew(this.certificationData.dynDocCertCuenta));
       this.dialog.open(CertificadoCuentaModalComponent, {
        id: 'dialogCert',
        width: '90%',
        height: '90%',
        disableClose: true,
        data: this.getUrlDynamicDocNew(this.certificationData.dynDocCertCuenta)
      }).afterClosed().subscribe(resp => {
        if (this.certificationData.print) {
          this.certificationData.nextMethod = 'SatisfiedCustomerRule';
          this.crmUtilService.SaveStepEntity('RL_SATISFIED', this.certificationData);
          this.SatisfiedCustomerRule();
        }
      });
      setTimeout(() => {
        if (!this.certificationData.print) {
          if (!this.certificationData.certBase64){
            const base64 = window.sessionStorage.getItem('certBase64');
            if(base64){
              this.certificationData.certBase64 = base64.split(',')[1];
            } else {
              this.crmUtilService.showModal('Error al obtener pdf, por favor recargue.' + false)
            }
          }
        this.certificationData.nextMethod = 'SendMailRule';
        this.crmUtilService.SaveStepEntity('RL_EMAIL', this.certificationData);
        this.SendMailRule();
        }
      }, 5000);
      //Recibe base64 de certificado
      window.addEventListener('message', function (e) {
        if(String(e.data).includes('pdf')){
          window.sessionStorage.setItem('certBase64', e.data);
        }
      });
    }

  /** Método que abre un modal para envío de correo electrónico. */
  showEmailModal() {
    this.dialog.getDialogById('dialogCert')?.close();
    this.dialog.open(SendEmailModalComponent, {
      height: '60%',
      width: '55%',
      disableClose: true,
      data: this.certificationData.certBase64
    }).afterClosed().subscribe(resp => {
      if (resp === 'OK') {
        this.certificationData.typeNotification = 'email';
        const response: ResponseNotification = {
          isValid: 'true',
          message: '',
          headerResponse: null
        }
        this.NotificationSent(response);
      }
    });
  }

  /** Método que abre un modal para envío del certificado a correspondencia. */
  showSendResidenceModal() {

    const requestDir: Partial<RequestConsultaDirec> = {
      headerRequest: this.commonParameterClass.returnHeaderAddres(),
      idDireccion: this.certificationData.idAdress,
      min: this.certificationData.min
    };

    this.dialog.open(SendResidenceModalComponent, {
      data: {
        dirc: requestDir,
        url: this.getUrlDynamicDoc(),
        disableClose: true,
        documentName: this.certificationData.documentName
      }
    }).afterClosed().subscribe(resp => {
      if (resp === 'OK') {
        this.certificationData.typeNotification = 'residence'
        this.sendNotification();
      }
    });
  }

  // Método que guarda la información para ir a preferencias de notificación.
  guardarInfo(notificationType: string) {
    this.requestSystemData.functionality = 'CUENTASALDIA';
    this.requestSystemData.process = 'PREFERENCIASNOTIFICACION_CUE';
    this.requestSystemData.guid = this.certificationData.serviceId;
    this.requestSystemData.data = '"origin": "' + (this.platformLocation as any).location.origin + '",';
    this.requestSystemData.data += '"pathname": "' + (this.platformLocation as any).location.pathname + '",';
    this.requestSystemData.data += '"notification": "' + notificationType + '",';
    this.CrmUtilServices.saveStep(this.requestSystemData);
  }
  getSerViceId() {
    this.requestParameter.name = 'FLUJOS_SERVICIOS';
    this.dataParametrosService.postParameter(this.requestParameter)
      .subscribe(dataResponseParamFlujoServicios => {
        this.certificationData.idService = JSON.parse(dataResponseParamFlujoServicios.VALUE_PARAMETER).FLUJOS_SERVICIOS.cuentasaldia;
        this.OpenTurnService();
      });
  }

  OpenTurnService() {
    this.requestParameter.name = 'AP_CR_TURNOS';
    this.dataParametrosService
      .postParameter(this.requestParameter)
      .subscribe(
        data => this.responseParameter = data,
        () => this.consultaParmError(),
        () => this.consumirAperturaTurno()
      );
  }

  // Método encargado de cambiar los valores de las variables
  // para deshabilitar campos y mostrar mensajes al usuario del error.
  disableFields(errorMsg, errorObj?, showAlert?: boolean) {
    this.inDebt = true;
    this.errorMessage = errorMsg;
    this.messageDebt = errorMsg;
    showAlert ? this.crmUtilService.showModal(errorMsg, false) : '';
    console.error(errorMsg, errorObj);
  }

  private certificadoNoGenerado() {
    if(this.certificationData.source == 'INS') {
      this.crmUtilService.showModal('La cuenta ' + sessionStorage.getItem('account') + ' se encuentra en mora, no es posible generar el certificado, por favor finalizar atención.', false);
    }
  }

  consumirAperturaTurno() {
    this.sg['tipoDocumentoCorto'] = this.certificationData.shortDocumentType;
    this.dataTurn = JSON.parse(this.responseParameter.VALUE_PARAMETER);
    this.request = this.commonParameterClass.OpenTurnService(this.dataTurn.AP_CR_TURNOS.apertura, this.certificationData.idTurn, this.certificationData.boolSetPresencial, this.certificationData.numberDocument + this.certificationData.shortDocumentType, this.certificationData.biHeaderId, this.certificationData.idService);
    // PARAMETROS DE ENCABEZADO NECESARIOS PARA EL SERVICIO
    this.request.headerRequestBizInteraction = new HeaderRequestBizInteraction();
    this.request.domainName = this.certificationData.source;
    // Obtienen la información del headerRequest que ya esta cargado
    this.instanciarParamsGD();
    this.request.headerRequestBizInteraction = this.headerRequest;
    if (this.certificationData.ExternalURLReturn != undefined && this.certificationData.ExternalURLReturn != null) {
      this.bizInteractionService.setPresencialBizInteraction(this.request).subscribe(dataResponseBI => this.responseBI = dataResponseBI,
        () => this.errorbiz(),
        () => this.succesBizInt()
      );
    } else {
      this.succesBizInt();
    }
  }
  succesBizInt() {
    console.log('Exitoso bi' + this.responseBI.message);
    try {
      const respBi = JSON.parse(this.responseBI.message);
      this.sg['idbizinteraction'] = respBi.id;
    } catch (error) {
      this.sg['idbizinteraction'] = '';
    }
    //CONSULTAMOS EL COMPONENTE DE FINALIZAR ATENCIÓN
    const formData = new FormData();
    formData.append('idFlow', this.sg['servicio']);
    formData.append('documentType', this.certificationData.shortDocumentType);
    formData.append('documentNumber', this.certificationData.numberDocument);
    formData.append('idTurn', this.certificationData.idTurn);
    formData.append('idUser', this.certificationData.idUser);
    formData.append('Min', this.certificationData.min);
    formData.append('urlReturn', decodeURIComponent(this.certificationData.URLReturn));
    formData.append('showCase', '1');
    formData.append('Name', 'name prueba');
    formData.append('lastName', 'name prueba');
    formData.append('MailForResponse', 'name prueba');
    formData.append('redirectOutFrame', '1');
    formData.append('biHeaderId', this.certificationData.biHeaderId);
    formData.append('idBI', this.sg['idbizinteraction']);
    formData.append('context', sessionStorage.getItem('context'));
    formData.append('environment', sessionStorage.getItem('environment'));
    formData.append('account', sessionStorage.getItem('account'));
    formData.append('accountCode', sessionStorage.getItem('account'));
    formData.append('channelTypeCode', sessionStorage.getItem('channelTypeCode'));
    this.sg['postCloseAttentionData'] = formData;
    this.showEnd = true;
  }
  errorbiz() {
    console.log('error biz');
  }

  consultaParmError() {
    console.log('Error al consumir service parámetro');
  }

  /** Método que muestra una pequeña alerta con un texto enviado por parámetro. */
  showSnackbar = (message) => this.snackbar.open(message, 'Ok', { duration: 5000 });

  instanciarParamsGD() {
    const jsonParam = JSON.stringify(this.sg['GestorDoc-InvClaro']);
    if (jsonParam) {

      this.headerRequest = new HeaderRequestInventario();
      this.headerRequest = this.commonParameterClass.headerRequestInventario(jsonParam);
    } else {
      console.log('Error en paso de variable global' + this.sg['GestorDoc-InvClaro']);
    }
  }

  getFinancingSearch() {
    const reqFinancingSearch = new RequestFinancingsSearch();
    reqFinancingSearch.headerRequest = new HeaderrequestFS();
    reqFinancingSearch.headerRequest.idBusinessTransaction = this.responseBI?.headerResponse?.traceabilityId || this.varHeaderRequest.idBusinessTransaction;
    reqFinancingSearch.headerRequest.idApplication = this.varHeaderRequest.idApplication;
    reqFinancingSearch.headerRequest.target = this.varHeaderRequest.target;
    reqFinancingSearch.headerRequest.startDate = new Date();
    reqFinancingSearch.headerRequest.channel = this.varHeaderRequest.channel;
    reqFinancingSearch.accountNumber = this.certificationData.account;
    reqFinancingSearch.returnActive = 'true';
    this.wsImeiTools.GetFinancingsSearch(reqFinancingSearch)
      .subscribe(resp => {
      });
  }

  private GetConsultarCuentas() {

    //this.certificationData.numberDocument = '1065133187';
    const REQUESTCONSULTARCUENTAS: RequestConsultarCuentas = {
      headerRequest: {
        channel: this.varHeaderRequest.channel,
        idBusinessTransaction: this.responseBI?.headerResponse?.traceabilityId || this.varHeaderRequest.idBusinessTransaction,
        idApplication: this.varHeaderRequest.idApplication,
        target: this.varHeaderRequest.target,
        startDate: new Date()
      },
      canal: 'MiClaroAsesor',
      numeroDocumento: this.certificationData.numberDocument,
      tipoDocumento: this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Id
    };

    // Pendiente por verificar si se debe consumir o no. Deiby
    this.wsImeiTools.PostSearchAccounts(REQUESTCONSULTARCUENTAS)
      .subscribe(resp => {
        if (resp && resp.isValid) {
          const respCuentas: ResponseConsultarCuentas = JSON.parse(resp.message);
          this.certificationData.referenceNumber = this.certificationData.account ? this.certificationData.account : respCuentas.listaCuentas.filter(cuenta => cuenta.tipoOperacion === 'M')[0]?.referencia;
        } else {
          console.error('Respuesta inválida de servicio que obtiene referencia. => ', resp);
        }
      }, (error) => console.error('Ocurrió un error en servicio ConsultarCuentas =>', error),
       () => {
        this.GetJoinFinancial();
        //this.GetJoinFinancialNew();
      });
  }

  private GetConsultarCuentasNew() {
    const wsConsultarCuentas = this.sg['ServiciosDAC'].ConsultarCuentas;
    //PARA PRUEBAS
    let dataTransform = {
      arrayData: [
        // Body
        { name: 'v1:documentType', value: this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Id },
        { name: 'v1:documentNumber', value: this.certificationData.numberDocument },
      ]
    } as DataTransform;

    this.wsSoapService.getDataXMLTrans(wsConsultarCuentas.Xml, dataTransform).then(
      (xml) => {
        this.wsSoapService.wsSoap(wsConsultarCuentas.Url, xml).then(
          (jsonResponse) => {
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'tns:checkAccountsResponse').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus['0']['tns:message']['0']).toLowerCase() === "exitoso") {
                    let listaCuentas = responseStatus['0']['tns:listAccounts'][0]
                    this.certificationData.referenceNumber = this.certificationData.account ? this.certificationData.account : listaCuentas['tns:DetailAccounts'].filter(cuenta => cuenta['tns:operationType'][0] === 'M')[0]['tns:reference'][0];
                    this.GetJoinFinancialNew();
                  } else {
                    console.error('Respuesta inválida de servicio que obtiene referencia. => ', jsonResponse);
                  }
                }
              );
            } catch (error) {
              console.error('Respuesta inválida de servicio que obtiene referencia. => ', error);
            }
          }, (error) => {
            console.error('Respuesta inválida de servicio que obtiene referencia. => ', error);
          }
        );
      },
      (error) => {
        console.error('Respuesta inválida de servicio que obtiene referencia. => ', error);
      }
    );
  }

  private getFinancingSearchIntegrator(): void {
    this.requestParameter.name = 'HeaderWSFinancingIntegrator';
    this.CrmUtilServices
      .postParameter(this.requestParameter)
      .subscribe(
        data => this.responseParameter = data,
        () => {
          const msgErr = 'Ha ocurrido un error en servicio parametros.';
          this.disableFields(msgErr);
        },
        () => {
          const header = JSON.parse(this.responseParameter.VALUE_PARAMETER);
          if (header.Username !== undefined) {
            this.requestFinancingI.headerRequest = header;
            this.requestFinancingI.NRO_DOCUMENTO = this.certificationData.numberDocument;
            this.requestFinancingI.TIPO_DOCUMENTO = this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Id;
            this.requestFinancingI.MIN = this.certificationData.min;

            this.wsImeiTools.getConsultaFinanciacionD(this.requestFinancingI).subscribe(
              data => this.responseFinancingI = data,
              (error) => {
                const msgErr = 'Ha ocurrido un error en servicio FinancingIntegrator.';
                this.disableFields(msgErr, error, false);
              },
              () => this.successfulConsultaFinan()
            );
          }
        }
      );
  }

  private successfulConsultaFinan(): void {
    if (this.responseFinancingI.isValid) {
      this.messageFnancingI = JSON.parse(this.responseFinancingI.message);
      if (this.messageFnancingI[1].MENSAJE !== null) {
        const saldoMora = this.messageFnancingI[1].MENSAJE.FINANCIACION?.SALDO_MORA?.toString();
        if (saldoMora !== '0') {
          const msgErr = 'El cliente tiene una financiación de $' + saldoMora + ' pendiente. No es posible generar el certificado.';
          this.disableFields(msgErr, null, false);
        } else { // Sin deuda
          // Validación mora RR y BSCS.
          if (this.certificationData.source === 'BSCS') {
            this.getMovilDayAccount();
          }

          // Se llama al método de llamado al servicio PaymentReferences para la validación de cuentas desactivadas.
          if (this.certificationData.source === 'RR') {
            this.GetPaymentReferences();
          }
        }
      } else {
        // Validación mora RR y BSCS.
        if (this.certificationData.source === 'BSCS') {
          this.getMovilDayAccount();
        }

        // Se llama al método de llamado al servicio PaymentReferences para la validación de cuentas desactivadas.
        if (this.certificationData.source === 'RR') {
          this.GetPaymentReferences();
        }
        // No Financiado
      }
    } else {
      const msgErr = 'Ha ocurrido un error en servicio FinancingIntegrator: ' + this.responseFinancingI.message;
      this.disableFields(msgErr);
    }
  }

  private GetPaymentReferences() {
    if (this.certificationData.min) {
      const requestCert: RequestCertificadoCuenta = {
        headerRequest: {
          idBusinessTransaction: '234321',
          idApplication: '54321234',
          target: 'target',
          startDate: new Date().toISOString(),
          channel: this.certificationData.channel || 'USSD'
        },
        subscriberNumber: this.certificationData.min
      };

      if (this.certificationData.status === '0') {
        this.certCuentaService.getPaymentReferences(requestCert)
          .subscribe(resp => {
            if (resp.isValid) {
              this.dataOk = true;
              const respPaymentRef = JSON.parse(resp.message);

              // Validación de PBI: 290129. Donde se genera el cert. para las cuentas desac. solamente si el valor deuda es menor o igual a 0.
              this.amountDebt = Number(respPaymentRef?.[2]?.accounts?.account?.TPR?.currentBalance);
              this.inDebt = this.inDebt ? this.inDebt : this.amountDebt > 0;
              this.amountDebt > 0 ? this.disableFields('El cliente tiene un valor pendiente de: ') : '';

            } else {
              const ERRORMSG = 'Ha ocurrido un error en el servicio que consulta el estado de cuenta para cuentas desactivadas. (PaymentReferences)';
              this.disableFields(ERRORMSG, null, false);
            }
          });
      }
      else {
        this.dataOk = true;
        this.inDebt = false
      }
    } else {
      this.showSnackbar('No se recibió el parámetro "Número de teléfono-Min", por favor validar.');
      console.error('No se recibió el parámetro "Número de teléfono-Min", por favor validar. ', this.certificationData.min);
    }
  }

  GetJoinFinancialNew() {

    const wsFinanciacionUnificada = this.sg['ServiciosDAC'].FinanciacionUnificada;
    //PARA PRUEBAS
    //this.certificationData.numberDocument = '1065133187';
    //this.certificationData.min = '3104610959';

    const HttpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction':'http://tempuri.org/IServicioFinanciacionConsultas/ConsultaContadoresFinanciacion'
      })
    }

    let dataTransform = {
      arrayData: [
        // Body
        { name: 'clar:TIPO_DOCUMENTO', value: this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Id },
        { name: 'clar:NRO_DOCUMENTO', value: this.certificationData.numberDocument },
        { name: 'clar:MIN', value: this.certificationData.min },
      ]
    } as DataTransform;


    this.wsSoapService.getDataXMLTrans(wsFinanciacionUnificada.Xml, dataTransform).then(
      (xml) => {
        this.wsSoapService.wsSoap(wsFinanciacionUnificada.Url, xml, HttpOptions).then(
          (jsonResponse) => {
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'ConsultaContadoresFinanciacionResult').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus['0']['a:CODIGO']['0']).toLowerCase() === "true") {
                      // Validacion Mora BSCS.
                      if (Number(responseStatus['0']['a:MENSAJE']['0']["a:FinanciacionTypeConsulContadores"][0]["a:SALDO_CAPITAL_TOTAL_ADEUDADO"][0]) === 0) {
                        //aqui debo continuar
                        this.GetLastPayment();
                      } else {
                        this.amountDebt = Number(responseStatus['0']['a:MENSAJE']['0']["a:FinanciacionTypeConsulContadores"][0]["a:SALDO_CAPITAL_TOTAL_ADEUDADO"][0]);
                        this.disableFields('El cliente tiene un valor pendiente en servicios móviles de: ', null, false);
                        this.isGenerado = false;
                        this.certificadoNoGenerado();
                      }
                  } else {
                    console.error('Ha ocurrido un error en el servicio FinanciacionUnificada. Favor verificar.. => ', jsonResponse);
                  }
                }
              );
            } catch (error) {
              console.error('Ha ocurrido un error consultando el servicio: FinanciacionUnificada. => ', error);
            }
          }, (error) => {
            console.error('Ha ocurrido un error consultando el servicio: FinanciacionUnificada. => ', error);
          }
        );
      },
      (error) => {
        console.error('Ha ocurrido un error consultando el servicio: FinanciacionUnificada. => ', error);
      }
    );

  }

  /// Método que envía una petición para obtener los datos de financiación unificada.
  GetJoinFinancial() {
    const REQUEST: RequestFinanciacionUnificada = {
      NroDocumento: this.certificationData.numberDocument,
      TipoDocumento: this.listJson.find(cd => cd.Code.trim() === this.certificationData.typeDocument).Id,
      Min: this.certificationData.min
    };

    this.wsImeiTools.GetJoinFinancial(REQUEST)
      .subscribe(resp => {
        if (resp && resp.isValid) {
          const RESPONSEFU: ResponseFinanciacionUnificada = JSON.parse(resp.message);
          if (RESPONSEFU.CODIGO) {
            const DATA_RESPONSE = RESPONSEFU.MENSAJE[0];
            // Validacion Mora BSCS.
            if (DATA_RESPONSE.SALDO_CAPITAL_TOTAL_ADEUDADO === 0) {
              //aqui debo continuar
              this.GetLastPayment();
            } else {
              this.amountDebt = DATA_RESPONSE.SALDO_CAPITAL_TOTAL_ADEUDADO;
              this.disableFields('El cliente tiene un valor pendiente en servicios móviles de: ', null, false);
              this.isGenerado = false;
              this.certificadoNoGenerado();
            }
          }
        } else {
          this.disableFields('Ha ocurrido un error en el servicio FinanciacionUnificada. Favor verificar.', resp, false);
        }
      }, (error) => {
        this.disableFields('Ha ocurrido un error consultando el servicio: FinanciacionUnificada', error, false);
      });
  }
  private GetLastPayment(): void{
    let dataTransform = {
      arrayData: [
        // CUERPO
        { name: 'ReferenceMinAccount', value: this.certificationData.account },
        // { name: 'ReferenceMinAccount', value: '1719160298' },
        { name: 'RefType', value: 0 }
      ]
    } as DataTransform;
    this.requestParameter = new RequestParameter();
    this.requestParameter.name ='LastPaymentSoap';
    this.dataParametrosService.postParameter(this.requestParameter).subscribe(respSoap =>{
      this.responseParameter = respSoap;
      this.paymentParam = JSON.parse(this.responseParameter.VALUE_PARAMETER);
      this.wsPayMentEnquirity = this.paymentParam.WsPaymentsEnquirity;
      this.wsSoapService.getDataXMLTrans(this.wsPayMentEnquirity.Xml, dataTransform).then(
        (xml)=> {
          this.wsSoapService.wsSoap(this.wsPayMentEnquirity.endpoint, xml).then(
            (jsonResponse)=>{
              try{
                this.wsSoapService.getObjectByElement(jsonResponse,'TotalPaymentAmount').then(
                  (valuePayment)=>{
                    valuePayment.length>0 && valuePayment[0]['_'] !== undefined ? this.certificationData.valuePayment = valuePayment[0]['_'] : this.defaultErrorSoapPayment();
                    this.getFinancingSearchIntegrator();
                  }
                )
              } catch(error){
                console.log('error en obtencion de nodo')
                this.defaultErrorSoapPayment();
              }
            },(error)=>{
              console.log('Error response soap');
              this.defaultErrorSoapPayment();
            })
        }, (error)=>{
          console.log('error en transformacion XML');
          this.defaultErrorSoapPayment();
        }
      )
    }, (error)=>{
      console.log('error en parametro soap');
      this.defaultErrorSoapPayment();
    })
  }
  defaultErrorSoapPayment(){
    this.messageDebt = 'Señor usuario no es posible generar el certificado ya que no cuenta con el valor del último pago';
    this.inDebt = true;
  }
  OpenEndAttentionModal() {
    const dialogRef = this.dialog.open(FinalizaratencionComponent, {
      disableClose: true,
      width: '850px',
      data: { idServicio: this.certificationData.idService, URLReturn: this.certificationData.URLReturn }
    });

    dialogRef.afterClosed().subscribe(resp => {
      // Resp = Data de retorno del modal.
    });
  }
  private GetPCLMRR(): void{
    let dataTransform = {
      arrayData: [
        // CUERPO
        { name: 'cuenta', value: this.certificationData.account },
        // { name: 'cuenta', value: '17817951' },
      ]
    } as DataTransform;
    this.requestParameter = new RequestParameter();
    this.requestParameter.name ='lastPayRRSoap';
    this.dataParametrosService.postParameter(this.requestParameter).subscribe(respSoap =>{
      this.responseParameter = respSoap;
      this.payRRParam = JSON.parse(this.responseParameter.VALUE_PARAMETER);
      this.wsPayCLMRR = this.payRRParam.WsPLCM;
      this.wsSoapService.getDataXMLTrans(this.wsPayCLMRR.Xml, dataTransform).then(
        (xml)=> {
          this.wsSoapService.wsSoap(this.wsPayCLMRR.endpoint, xml).then(
            (jsonResponse)=>{
              try{
                this.wsSoapService.getObjectByElement(jsonResponse,'lastPay').then(
                  (valuePayment)=>{
                    console.log(valuePayment);
                    valuePayment.length>0 && valuePayment[0] !== undefined ? this.certificationData.valuePayment = Number(valuePayment[0]) : this.defaultErrorSoapPayment();
                    //instanciamosRR
                    this.getFinancingSearchIntegrator();
                  }
                )
              } catch(error){
                console.log('error en obtencion de nodo')
                this.defaultErrorSoapPayment();
              }
            },(error)=>{
              console.log('Error response soap');
              this.defaultErrorSoapPayment();
            })
        }, (error)=>{
          console.log('error en transformacion XML');
          this.defaultErrorSoapPayment();
        }
      )
    }, (error)=>{
      console.log('error en parametro soap');
      this.defaultErrorSoapPayment();
    })
  }


  private getPendingBilling(): void{
    let dataTransform = {
      arrayData: [
        // CUERPO
        { name: 'accountNumber', value: this.certificationData.account },
        // { name: 'ReferenceMinAccount', value: '1719160298' },
        //{ name: 'RefType', value: 0 }
      ]
    } as DataTransform;
    this.requestParameter = new RequestParameter();
    this.requestParameter.name ='PENDING_BILLING';
    this.dataParametrosService.postParameter(this.requestParameter).subscribe(respSoap =>{
      this.responseParameter = respSoap;
      this.paymentParam = JSON.parse(this.responseParameter.VALUE_PARAMETER);
      this.wsPostSale = this.paymentParam.WsPostSale;
      this.wsSoapService.getDataXMLTrans(this.wsPostSale.Xml, dataTransform).then(
        (xml)=> {
          this.wsSoapService.wsSoap(this.wsPostSale.endpoint, xml).then(
            (jsonResponse)=>{
              try{
                this.wsSoapService.getObjectByElement(jsonResponse,'currentBalance').then(
                  (currentBalance)=>{
                    this.currentBalance = currentBalance[0];
                    if (this.currentBalance != undefined &&  parseFloat(this.currentBalance) <= 0.0)
                    {
                      this.wsSoapService.getObjectByElement(jsonResponse,'paymentReference').then(
                        (paymentReference)=>{
                          this.paymentReferenceOfPendingBilling = paymentReference[0];
                          if (this.paymentReferenceOfPendingBilling != undefined)
                          {
                            this.getBillingPayments();
                            return;
                          }else
                          {
                            this.messageDebt = "paymentReference de PendingBilling es indefinido";
                            this.inDebt = true;
                          }
                          //this.getCertificadoCuenta();
                        }, error => {
                          this.messageDebt = "Error obteniendo el nodo paymentReference";
                          this.inDebt = true;
                        }
                      )
                      this.wsSoapService.getObjectByElement(jsonResponse,'cutoffDate').then(
                        (valuePayment)=>{
                          this.lastBilledDate = valuePayment[0];
                          if (this.lastBilledDate === undefined || this.lastBilledDate === '') {
                            this.messageDebt = 'Señor usuario no es posible generar el certificado ya que no cuenta con fecha de pago.';
                            this.crmUtilService.showModal('Señor usuario no es posible generar el certificado ya que no cuenta con fecha de pago.', false);
                            this.isGenerado = false;
                            this.inDebt = true;
                            return;
                          }else{
                            this.messageDebt = "LastBilledDate es indefinido";
                            this.inDebt = true;
                          }
                          this.getCertificadoCuenta();
                        }, error => {
                          this.messageDebt = "Error al obtener el nodo 'cutoffDate'";
                          this.inDebt = true;
                        }
                      )
                    }else{
                      //El cliente se encuentra en mora
                      this.messageDebt = "Señor usuario no es posible generar el certificado ya que no cuenta con el valor del último pago";
                      this.isGenerado = false;
                      this.crmUtilService.showModal(this.messageDebt, false);
                      this.inDebt = true;
                    }
                  }, error => {
                    this.messageDebt = "Error al obtener el nodo currentBalance";
                    this.inDebt = true;
                  }
                )
              } catch(error){
                console.log('error en obtencion de nodo')
                this.defaultErrorSoapPayment();
              }
            },(error)=>{
              console.log('Error response soap');
              this.defaultErrorSoapPayment();
            })
        }, (error)=>{
          console.log('error en transformacion XML');
          this.defaultErrorSoapPayment();
        }
      )
    }, (error)=>{
      console.log('error en parametro soap');
      this.defaultErrorSoapPayment();
    })
          }

  setStep(index: number) {
    this.step = index;
  }

  public validarCertificacionSubscripcion(SubscripEquipos: boolean){
    if(this.isGenerado) {
      if (SubscripEquipos === true) {
        this.tipoCertificacion = '3';
      } else {
        this.tipoCertificacion = '1';
      }
      this.SetSubscriberPackage(SubscripEquipos)
    } else {
      this.certificadoNoGenerado();
    }
  }

  /**
   * Método para preparar request de consumo para servicio de SubscriberPackages.
   * @author JHONNATAN OSORIO - 02 Agos 2021
   */
  private SetSubscriberPackage(SubscripEquipos: boolean): void {
    const wsSubscriberP = this.sg['ServiciosDAC'].SubscriberPackages;
    const dataTransform = {
      arrayData: [
        { name: 'identificationType', value: this.idTypeDoc },
        { name: 'identificationNumber', value: sessionStorage.getItem('documentNumber') }
        //{ name: 'subscriberNumber', value: '573100038600' }
      ]
    } as DataTransform;
    this.ConsumeSubscriberPackage(wsSubscriberP.Url, wsSubscriberP.Xml, dataTransform, SubscripEquipos);
  }

  /**
   * Método para consultar servicios de Suscripciones (SubscriberPackage).
   * @author JHONNATAN OSORIO - 02 Agos 2021
   * @param url url servicio SOAP
   * @param xmlString XML de la operación
   * @param data data para modificación del XML
   */
  private ConsumeSubscriberPackage(url: string, xmlString: string, data: DataTransform, SubscripEquipos: boolean): void {
    this.wsSoapService.getDataXMLTrans(xmlString, data).then((xml) => {
        this.wsSoapService.wsSoap(url, xml).then((jsonResponse) => {
            try {
              this.ValidateSubscriberPackage(jsonResponse, SubscripEquipos);
            } catch (error) {
              const msgErr = 'Error al consumir servicio para consulta de subscripciones (SubscriberPackages): ' + error + '. ';
              this.disableFields(msgErr);
            }

          }
        );
      }, (error) => {
        const msgErr = 'Error al consumir servicio para consulta de subscripciones (SubscriberPackages): ' + error + '. ';
        this.disableFields(msgErr);
      }
    );
  }

  /**
   * Logica y validación de respuesta de servicio de ConsumeSubscriberPackage.
   * @author JHONNATAN OSORIO - 02 Agos 2021
   * @param jsonResponse respues servicio ConsumeSubscriberPackage
   */
  private ValidateSubscriberPackage(jsonResponse, SubscripEquipos: boolean) {
    this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then((status) => {
      if (status[0]['status'][0].toLowerCase() === 'ok') {
        let suspByFraud = false;
        this.wsSoapService.getObjectByElement(jsonResponse, 'productCharacteristics').then((productCharacteristics: any) => {
          suspByFraud = productCharacteristics.some(product => {
            return product.name[0] === 'susByFraud';
          });
        });
        this.wsSoapService.getObjectByElement(jsonResponse, 'servicesAccount').then((serviceAccount) => {
          if (serviceAccount[0]['status'][0] === 'Suspended' && suspByFraud) {
            this.crmUtilService.showModal('Su línea está suspendida por fraude, por favor finalizar atención.', false);
          } else if(serviceAccount[0]['status'][0] === 'Active' || (serviceAccount[0]['status'][0] === 'Suspended' && !suspByFraud)) {
            this.accountNumberSubs = serviceAccount[0]['accountNumber'][0];
            this.SetSubscriptionCertification(SubscripEquipos);
          }
        });
      } else {
        this.crmUtilService.showModal('No se encontró información de subscripciones para el cliente.', false);
      }
    });
  }

  /**
   * Método para preparar request de consumo para servicio de SubscriptionCertification.
   * @author JHONNATAN OSORIO - 05 Agos 2021
   */
  private SetSubscriptionCertification(SubscripEquipos: boolean): void {
    this.suscripciones = [];
    const wsSubscriberP = this.sg['ServiciosDAC'].SubscriptionCertification;
    if(sessionStorage.getItem('type') == 'HOGAR' || sessionStorage.getItem('type') == 'FIJA'){
      const dataTransform = {
        arrayData: [
          { name: 'accountNumber', value: window.sessionStorage.getItem('account') }
        ]
      } as DataTransform;
      this.ConsumeSubscriptionCertification(wsSubscriberP.Url, wsSubscriberP.Xml.replace('{0}', '<accountNumber></accountNumber>'), dataTransform, SubscripEquipos);    
    }else{      
      const dataTransform = {
            arrayData: [
              { name: 'subscriberNumber', value: window.sessionStorage.getItem('min') }
              //{ name: 'subscriberNumber', value: '573100542040' }
            ]
          } as DataTransform;
      this.ConsumeSubscriptionCertification(wsSubscriberP.Url, wsSubscriberP.Xml.replace('{0}', '<subscriberNumber></subscriberNumber>'), dataTransform, SubscripEquipos);
    }
  }

  /**
   * Método para consultar servicios de Suscripciones (SubscriptionCertification).
   * @author JHONNATAN OSORIO - 05 Agos 2021
   * @param url url servicio SOAP
   * @param xmlString XML de la operación
   * @param data data para modificación del XML
   */
  private ConsumeSubscriptionCertification(url: string, xmlString: string, data: DataTransform, SubscripEquipos: boolean): void {
    this.wsSoapService.getDataXMLTrans(xmlString, data).then((xml) => {
        this.wsSoapService.wsSoap(url, xml).then((jsonResponse) => {
            try {
              this.ValidateSubscriptionCertification(jsonResponse, SubscripEquipos);
            } catch (error) {
              const msgErr = 'Error al consumir servicio para consulta de subscripción (SubscriptionCertification): ' + error + '. ';
              this.disableFields(msgErr);
            }
          }
        );
      }, (error) => {
        const msgErr = 'Error al consumir servicio para consulta de subscripción (SubscriptionCertification): ' + error + '. ';
        this.disableFields(msgErr);
      }
    );
  }

  /**
   * Logica y validación de respuesta de servicio de SubscriptionCertification.
   * @author JHONNATAN OSORIO - 05 Jun 2021
   * @param jsonResponse respuesta servicio SubscriptionCertification
   */
  private ValidateSubscriptionCertification(jsonResponse, SubscripEquipos: boolean) {
    this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then((status) => {
      if(status[0]['status'][0].toLowerCase() === 'ok') {
        this.wsSoapService.getObjectByElement(jsonResponse, 'tns:getSubscriptionCertificationResponse').then((certificationResponse: any) => {
          certificationResponse[0]['customerAddressStreet']?this.customerAddressStreet = certificationResponse[0]['customerAddressStreet'][0]:this.customerAddressStreet = '';
          certificationResponse[0]['paymentLastDate']?this.paymentLastDate = certificationResponse[0]['paymentLastDate'][0]:this.paymentLastDate = '';
          certificationResponse[0]['paymentLastAmount']?this.paymentLastAmount = certificationResponse[0]['paymentLastAmount'][0]:this.paymentLastAmount = '';
        });
        if (this.businessRulesValidation()) {
          this.wsSoapService.getObjectByElement(jsonResponse, 'subscription').then((jsonSubscription: any) => {
            jsonSubscription.forEach(item => {
              const subscript: subscripcion = {
                id: item.id,
                serviceName: item.planDescription,
                detail: false
              };
              this.suscripciones.push(subscript);
            });
          });
          if (SubscripEquipos) {
            this.SetEquipmentsTerminalsCertification(null, true);
          }
        }
      } else {
        this.crmUtilService.showModal('No se encontró información relacionada a la subscripción para el cliente.', false);
      }
    });
  }

  public validarUniqueCustomerCertification(){
    if(this.isGenerado) {
      this.tipoCertificacion = '4';
      this.SetUniqueCustomerCertification();
    } else {
      this.certificadoNoGenerado();
    }
  }

  /**
   * Método para preparar request de consumo para servicio de UniqueCustomerCertification
   * @author JHONNATAN OSORIO - 10 Agos 2021
   */
  private SetUniqueCustomerCertification(): void {
    this.suscripciones = [];
    const wsSubscriberP = this.sg['ServiciosDAC'].UniqueCustomerCertification;
    const dataTransform = {
      arrayData: [
        { name: 'identificationType', value: this.idTypeDoc },
        { name: 'identificationNumber', value: sessionStorage.getItem('documentNumber') }
        //{ name: 'identificationType', value: 1 },
        //{ name: 'identificationNumber', value: '141431835' }
      ]
    } as DataTransform;
    this.ConsumeUniqueCustomerCertification(wsSubscriberP.Url, wsSubscriberP.Xml, dataTransform);
  }

  /**
   * Método para consultar servicios de Suscripciones (UniqueCustomerCertification)
   * @author JHONNATAN OSORIO - 10 Agos 2021
   * @param url url servicio SOAP
   * @param xmlString XML de la operación
   * @param data data para modificación del XML
   */
  private ConsumeUniqueCustomerCertification(url: string, xmlString: string, data: DataTransform): void {
    this.wsSoapService.getDataXMLTrans(xmlString, data).then((xml) => {
        this.wsSoapService.wsSoap(url, xml).then((jsonResponse) => {
            try {
              this.ValidateUniqueCustomerCertification(jsonResponse);
            } catch (error) {
              const msgErr = 'Error al consumir servicio para consulta de subscripciones por cliente único (UniqueCustomerCertification): ' + error + '. ';
              this.disableFields(msgErr);
            }
          }
        );
      }, (error) => {
        const msgErr = 'Error al consumir servicio para consulta de subscripciones por cliente único (UniqueCustomerCertification): ' + error + '. ';
        this.disableFields(msgErr);
      }
    );
  }

  /**
   * logica y validación de respuesta de servicio de UniqueCustomerCertification
   * @author JHONNATAN OSORIO - 11 Jun 2021
   * @param jsonResponse respuesta servicio UniqueCustomerCertification
   */
  private ValidateUniqueCustomerCertification(jsonResponse) {
    this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then((responseStatus: any) => {
      if (responseStatus[0]['status'][0].toLowerCase() === 'ok') {
        this.wsSoapService.getObjectByElement(jsonResponse, 'customer').then((customer: any) => {
          customer[0]['addressStreet']?this.customerAddressStreet = customer[0]['addressStreet'][0]._:this.customerAddressStreet = '';
          customer[0]['paymentLastDate']?this.paymentLastDate = customer[0]['paymentLastDate'][0]:this.paymentLastDate = '';
          customer[0]['paymentLastAmount']?this.paymentLastAmount = customer[0]['paymentLastAmount'][0]:this.paymentLastAmount = '';
          customer[0]['paymentReference']?this.paymentReference = customer[0]['paymentReference'][0]:this.paymentReference = '';
          if (this.businessRulesValidation()) {
            this.SetEquipmentsTerminalsCertification(customer[0]['subscriptions'][0].subscription, false)
          }
        });
      } else {
        this.crmUtilService.showModal('No se encontró información de subscripciones para el cliente.', false);
      }
    });
  }

  public validarEquipmentsTerminalsCertification(SubscripEquipos: boolean){
    if(this.isGenerado) {
      this.countEquipment = 0;
      this.tipoCertificacion = '2';
      this.SetEquipmentsTerminalsCertification(null, SubscripEquipos)
    } else {
      this.certificadoNoGenerado();
    }
  }

  /**
   * Método para preparar request de consumo para servicio de EquipmentsTerminalsCertification
   * @author JHONNATAN OSORIO - 03 Sept 2021
   */
  private SetEquipmentsTerminalsCertification(subscriptions, SubscripEquipos: boolean): void {
    this.suscripciones = [];
    this.equipments = [];
    const wsSubscriberP = this.sg['ServiciosDAC'].EquipmentsTerminalsCertification;
    const dataTransform = {
      arrayData: [
        { name: 'accountNumber', value: sessionStorage.getItem('account') }
        //{ name: 'accountNumber', value: '93000000041713' }
      ]
    } as DataTransform;
    this.ConsumeEquipmentsTerminalsCertification(wsSubscriberP.Url, wsSubscriberP.Xml, dataTransform, subscriptions, SubscripEquipos);
  }

  /**
   * Método para consultar servicios de Suscripciones(EquipmentsTerminalsCertification)
   * @author JHONNATAN OSORIO - 03 Sept 2021
   * @param url url servicio SOAP
   * @param xmlString XML de la operación
   * @param data data para modificación del XML
   */
  private ConsumeEquipmentsTerminalsCertification(url: string, xmlString: string, data: DataTransform, subscriptions, SubscripEquipos: boolean): void {
    this.wsSoapService.getDataXMLTrans(xmlString, data).then((xml) => {
        this.wsSoapService.wsSoap(url, xml).then((jsonResponse) => {
            try {
              this.ValidateEquipmentsTerminalsCertification(jsonResponse, subscriptions, SubscripEquipos);
            } catch (error) {
              const msgErr = 'Error al consumir servicio para consulta de equipos y terminales (EquipmentsTerminalsCertification): ' + error + '. ';
              this.disableFields(msgErr);
            }
          }
        );
      }, (error) => {
        const msgErr = 'Error al consumir servicio para consulta de equipos y terminales (EquipmentsTerminalsCertification): ' + error + '. ';
        this.disableFields(msgErr);
      }
    );
  }

  /**
   * Logica y validación de respuesta del servicio EquipmentsTerminalsCertification
   * @author SANTIAGO VALENCIA - 15 Sept 2021
   * @param jsonResponse respuesta servicio EquipmentsTerminalsCertification
   */
  private ValidateEquipmentsTerminalsCertification(jsonResponse, subscriptions, SubscripEquipos: boolean) {
    this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then((responseStatus: any) => {
      if (responseStatus[0]['status'][0].toLowerCase() === 'ok') {
        this.wsSoapService.getObjectByElement(jsonResponse, 'equipment').then((equipment: any) => {
          this.subscripEquipos = SubscripEquipos;
          this.subscriptions = subscriptions;
          this.lengthEquipment = equipment.length;
          equipment.forEach(item => {
            this.countEquipment++;
            this.GetFinancingInfo(item);
          });

        });
      } else {
        this.crmUtilService.showModal('No se encontró información de equipos y/o terminales asociados a la cuenta.', false);
      }
    });
  }

  /**
   * Método para preparar request de consumo para servicio de GetFinancingInfo
   * @author JHONNATAN OSORIO - 16 Dic 2021
   * @param equipment equipo sobre el cual se desea obtener la información
   */
  public GetFinancingInfo(equipment): void {
    const wsSubscriberP = this.sg['ServiciosDAC'].getFinancingInfo;
    const dataTransform = {
      arrayData: [
        { name: 'searchCriteria', value: equipment.financingId[0]}
      ]
    } as DataTransform;
    this.ConsumeGetFinancingInfo(wsSubscriberP.Url, wsSubscriberP.Xml, dataTransform, equipment);
  }

  /**
   * Método para consumir el servicio GetFinancingInfo
   * @author JHONNATAN OSORIO - 16 Dic 2021
   * @param url url servicio SOAP
   * @param xmlString XML de la operación
   * @param data data para modificación del XML
   * @param equipment equipo sobre el cual se desea obtener la información
   */
  private ConsumeGetFinancingInfo(url: string, xmlString: string, data: DataTransform, equipment): void {
    this.wsSoapService.getDataXMLTrans(xmlString, data).then((xml) => {
        this.wsSoapService.wsSoap(url, xml, this.GetHeaders('GetFinancings')).then((jsonResponse) => {
            try {
              this.ValidateGetFinancingInfo(jsonResponse, equipment);
            } catch (error) {
              const msgErr = 'Error al consumir servicio GetFinancingInfo: ' + error + '. ';
              this.disableFields(msgErr);
            }
          }
        );
      }, (error) => {
        const msgErr = 'Error al consumir servicio GetFinancingInfo: ' + error + '. ';
        this.disableFields(msgErr);
      }
    );
  }

  /**
   * Logica y validación de respuesta del servicio GetFinancingInfo
   * @author JHONNATAN OSORIO - 16 Dic 2021
   * @param jsonResponse respuesta servicio GetFinancingInfo
   * @param equipment equipo sobre el cual se desea obtener la información
   */
  private ValidateGetFinancingInfo(jsonResponse, equipment) {
    this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then((responseStatus: any) => {
      if (responseStatus[0]['status'][0].toLowerCase() === 'ok') {
          this.wsSoapService.getObjectByElement(jsonResponse, 'financing').then((financing: any) => {
            console.log('FINANCING', financing);
            equipment.imeiSerial = financing[0].equipmentRef;
            equipment.previousCutOffDate = financing[0].previousCutOffDate;
            equipment.financingShortId = financing[0].financingId;
            this.FinancingsSearch(equipment);
          });
      } else {
        this.crmUtilService.showModal('No se encontró información del equipo.', false);
      }
    });
  }

  /**
 * Método para preparar request de consumo para servicio de FinancingsSearch
 * @author JHONNATAN OSORIO - 16 Dic 2021
 * @param equipment equipo sobre el cual se desea obtener la información
 */
   public FinancingsSearch(equipment): void {
    const wsSubscriberP = this.sg['ServiciosDAC'].FinancingSearch;
    const dataTransform = {
      arrayData: [
        { name: 'financingId', value: '15481' }//equipment.financingShortId[0]}
      ]
    } as DataTransform;
    this.ConsumeFinancingsSearch(wsSubscriberP.Url, wsSubscriberP.Xml, dataTransform, equipment);
  }

  /**
   * Método para consumir el servicio FinancingsSearch
   * @author JHONNATAN OSORIO - 16 Dic 2021
   * @param url url servicio SOAP
   * @param xmlString XML de la operación
   * @param data data para modificación del XML
   * @param equipment equipo sobre el cual se desea obtener la información
   */
  private ConsumeFinancingsSearch(url: string, xmlString: string, data: DataTransform, equipment): void {

    this.wsSoapService.getDataXMLTrans(xmlString, data).then((xml) => {
        this.wsSoapService.wsSoap(url, xml, this.GetHeaders('GetFinancings')).then((jsonResponse) => {
            try {
              this.ValidateFinancingsSearch(jsonResponse, equipment);
            } catch (error) {
              const msgErr = 'Error al consumir servicio de referencias de pago (PaymentReferencesMgmt): ' + error + '. ';
              this.disableFields(msgErr);
            }
          }
        );
      }, (error) => {
        const msgErr = 'Error al consumir servicio de referencias de pago (PaymentReferencesMgmt): ' + error + '. ';
        this.disableFields(msgErr);
      }
    );
  }

  /**
   * Logica y validación de respuesta del servicio FinancingsSearch
   * @author JHONNATAN OSORIO - 16 Dic 2021
   * @param jsonResponse respuesta servicio FinancingsSearch
   * @param equipment equipo sobre el cual se desea obtener la información
   */
  private ValidateFinancingsSearch(jsonResponse, equipment) {
    this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then((responseStatus: any) => {
      if (responseStatus[0]['status'][0].toLowerCase() === 'ok') {
          this.wsSoapService.getObjectByElement(jsonResponse, 'financing').then((financing: any) => {
            equipment.lastPaymentDate = financing[0].lastPaymentDate;
            equipment.lastPayment = Number(financing[0].lastPayment[0]) + Number(financing[0].latePaymentTax[0]) + Number(financing[0].interestTax[0]);
            equipment.equipmentRef = financing[0].paymentReference;
            this.equipments.push(equipment);
            console.log(this.equipments);
            if (this.countEquipment === this.lengthEquipment && this.businessRulesValidation()) {
              if (!this.subscripEquipos) {
                this.GenerarCertificado(this.subscriptions, true);
              }
            }
          });
      } else {
        this.crmUtilService.showModal('No se encontró información de referencias de pago para la cuenta.', false);
      }
    });
  }

  /**
   * Método para preparar request de consumo para servicio de PaymentReferencesMgmt
   * @author SANTIAGO VALENCIA - 17 Sep 2021
   */
   public SetPaymentReferencesMgmt(): void {
    const wsSubscriberP = this.sg['ServiciosDAC'].PaymentReferencesMgmt;
    const dataTransform = {
      arrayData: [
        { name: 'accountNumber', value: sessionStorage.getItem('account') }
        //{ name: 'accountNumber', value: '93000000314411' }
      ]
    } as DataTransform;
    this.ConsumePaymentReferencesMgmt(wsSubscriberP.Url, wsSubscriberP.Xml, dataTransform);
  }

  /**
   * Método para consumir el servicio PaymentReferencesMgmt
   * @author SANTIAGO VALENCIA - 17 Sep 2021
   * @param url url servicio SOAP
   * @param xmlString XML de la operación
   * @param data data para modificación del XML
   */
  private ConsumePaymentReferencesMgmt(url: string, xmlString: string, data: DataTransform): void {
    this.wsSoapService.getDataXMLTrans(xmlString, data).then((xml) => {
        this.wsSoapService.wsSoap(url, xml).then((jsonResponse) => {
            try {
              this.ValidatePaymentReferencesMgmt(jsonResponse);
            } catch (error) {
              const msgErr = 'Error al consumir servicio de referencias de pago (PaymentReferencesMgmt): ' + error + '. ';
              this.disableFields(msgErr);
            }
          }
        );
      }, (error) => {
        const msgErr = 'Error al consumir servicio de referencias de pago (PaymentReferencesMgmt): ' + error + '. ';
        this.disableFields(msgErr);
      }
    );
  }

  /**
   * Logica y validación de respuesta del servicio PaymentReferencesMgmt
   * @author SANTIAGO VALENCIA - 17 Sep 2021
   * @param jsonResponse respuesta servicio PaymentReferencesMgmt
   */
  private ValidatePaymentReferencesMgmt(jsonResponse) {
    this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then((responseStatus: any) => {
      if (responseStatus[0]['status'][0].toLowerCase() === 'ok') {
          this.wsSoapService.getObjectByElement(jsonResponse, 'accounts').then((accounts: any) => {
              this.collectionIndMgmt[0] = accounts[0]['account'][0]['TPR'][0]['SPR'][0]['collectionInd'][0];
              this.currentBalanceMgmt[0] = accounts[0]['account'][0]['TPR'][0]['SPR'][0]['currentBalance'][0];
              this.accountNumberMgmt[0] = accounts[0]['account'][0]['number'][0];
          });
      } else {
        this.crmUtilService.showModal('No se encontró información de referencias de pago para la cuenta.', false);
      }
    });
  }


  /**
   * Método para generar la data para la generación del certificado.
   *
   * @author JHONNATAN OSORIO - 12 Jun 2021
   * @param suscripcion
   */
  public GenerarCertificado(subscripcions, clienteUnico) {
    let dataTable = [];
    if (clienteUnico === false) {
      dataTable.push(subscripcions);
    } else {
      dataTable = subscripcions;
    }

    const dataCertMovil: ResponseMessageCtaDiaMovil = this.responseCtaMovil;
    moment.locale('es');
    const name = this.titleCasePipe.transform(dataCertMovil.NombresApellidos);
    const currentDate = moment();
    const lastPayment = dataCertMovil.FechaUltimoPago ? moment(dataCertMovil.FechaUltimoPago, 'DD/MM/YYYY') : moment();
    const lastBilledDate = dataCertMovil.FechaFacturación ? moment(dataCertMovil.FechaFacturación, 'DD/MM/YYYY') : moment();
    this.certificationData.dynDocCertCuenta = {
      idTemplate: environment.idTemplateCertCuent,
      data: {
        currentDay: moment(currentDate).format('DD'),
        currentMonth: this.titleCasePipe.transform(moment(currentDate).format('MMMM')),
        currentYear: moment(currentDate).format('YYYY'),
        name: sessionStorage.getItem('name') + ' ' +  sessionStorage.getItem('surname '),
        addresService: sessionStorage.getItem('AddressId') || this.customerAddressStreet,
        typeDocument: sessionStorage.getItem('documentType'),
        numberId: sessionStorage.getItem('documentNumber'),
        consecutive:' ',
        user: sessionStorage.getItem('user') || ' ',
        table: this.construccionTable(dataTable),
        serviceName: this.certificationData.account,
        serviceNumber: this.certificationData.serviceNumber,
        billYear: moment(lastBilledDate).format('YYYY'),
        payYear: moment(lastPayment).format('YYYY'),
        billDay: moment(lastBilledDate).format('DD'),
        payDay: moment(lastPayment).format('DD'),
        billMonth: this.titleCasePipe.transform(moment(lastBilledDate).format('MMMM')),
        payMonth: this.titleCasePipe.transform(moment(lastPayment).format('MMMM')),
        valuePayment: '$',
        tdWidth: '50'
      }
    };
    //console.log('table', this.construccionTable(dataTable));
    this.goToDynamicDocumentByData();
  }

  /**
   * Método para validar si es persona natural.
   * @author SANTIAGO VALENCIA - 17 Sep 2021
   */
  public isPerson(): boolean {
    if (sessionStorage.getItem('documentType') != 'NI') {
      return true;
    }
  }

  /**
   * Método para mostrar mensaje de certificacion a personas naturales.
   * @author SANTIAGO VALENCIA - 17 Sep 2021
   */
   public alertOnlyPerson(): void {
    if (sessionStorage.getItem('documentType') == 'NI') {
      this.crmUtilService.showModal('Solo se generan certificaciones de cuenta al día para persona natural, por favor finalizar atención.', false);
    }
  }

  /**
   * Método para validar reglas de negocio.
   * @author SANTIAGO VALENCIA - 20 Sep 2021
   */
   public businessRulesValidation(): boolean {
    this.SetPaymentReferencesMgmt();
    for (var i = 0; i > this.collectionIndMgmt.length; i++) {
      if (this.collectionIndMgmt[i].toLowerCase() === "true") {
        this.crmUtilService.showModal('Cliente se encuentra en mora, no es posible generar el certificado, por favor finalizar atención.', false);
        return false;
      }
      if (this.currentBalanceMgmt[i] > 0) {
        this.crmUtilService.showModal('La cuenta ' + this.accountNumberMgmt[i] + ' se encuentra en mora, no es posible generar el certificado, por favor finalizar atención.', false);
        return false;
      }
    }
    return true;
  }

  /**
   * Metodo que genera el template de la tabla para el certificado
   * @author JHONNATAN OSORIO - 12 Jun 2021
   * @param suscripcion
   * @param dataTable
   * @returns el template de la tabla poblada
   */
   private construccionTable(dataTable) {
     console.log(this.certificationData);
    let partsTable = '';
    partsTable += `<tr>`
    if (this.tipoCertificacion !== '2') {
      dataTable.forEach((subscripcion) => {
        partsTable += `
        <td class="tdTable">${subscripcion['serviceName'][0]}</td>
        <td class="tdTable">${subscripcion['id'][0]}</td>
        <td class="tdTable">${this.customerAddressStreet || ''}</td>
        <td class="tdTable">${this.paymentReference || ''}</td>
        <td class="tdTable">${this.lastBilledDate || ''}</td>
        <td class="tdTable">${this.paymentLastDate || ''}</td>
        <td class="tdTable">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(this.paymentLastAmount))}</td>
        <td class="tdTable">${''}</td>
        <td class="tdTable">${''}</td>
        <td class="tdTable">${''}</td></tr>`
      });
    }
    if (this.tipoCertificacion !== '1') {
      this.equipments.forEach((equipment) => {
        partsTable += `
        <td class="tdTable">${equipment['reference'][0]}</td>
        <td class="tdTable">${equipment['financingId'][0]}</td>
        <td class="tdTable">${this.customerAddressStreet || ''}</td>
        <td class="tdTable">${equipment.equipmentRef[0] || ''}</td>
        <td class="tdTable">${equipment.previousCutOffDate[0] || ''}</td>
        <td class="tdTable">${equipment.lastPaymentDate[0] || ''}</td>
        <td class="tdTable">${equipment.lastPayment || ''}</td>
        <td class="tdTable">${equipment['imeiSerial'] !== undefined ? equipment['imeiSerial'][0] : ''}</td>
        <td class="tdTable">${equipment['installmentsPaid'][0]}</td>
        <td class="tdTable">${equipment['installmentsRemaining'][0]}</td></tr>`
      });
    }
    return partsTable;
  }

  /**
  * Método para mostrar regla para preguntar si cliente requiere infrmación fisica
  * @author CINDY PANCHE - 16 Sep 2021
  */
  private SendMailRule(): void {
    if (!this.dialog.getDialogById('dialogRule')) {
      this.dialog.open(DecisionTableModalComponent, {
        disableClose: true,
        id: 'dialogRule',
        data: 'EnvioCorreoElectronico'
      }).afterClosed().subscribe(resp => {
        if (resp !== undefined && resp.value === 'SI') {
          this.certificationData.nextMethod = 'PrintKB';
          this.crmUtilService.SaveStepEntity('KB_PRINT', this.certificationData);
          this.PrintKB();
        } else if (resp !== undefined) {
          this.certificationData.nextMethod = 'showEmailModal';
          this.crmUtilService.SaveStepEntity('M_EMAIL', this.certificationData);
          this.showEmailModal();
        }
      });
    }
  }

  /**
   * Método para mostrar base de conocimiento 'IMPRESION'
   * @author CINDY PANCHE - 16 Sep 2021
   */
  private PrintKB(): void {
    this.knowledgeBaseLib.searchByNameScript('IMPRESION');
    this.knowledgeBaseLib.openKnowledgeBaseModal({ btnCancel: false, titleScript: false }).then(respBase => {
      if (respBase) {
        this.certificationData.nextMethod = 'AcceptConditionsRule';
        this.crmUtilService.SaveStepEntity('RL_CONDITIONS', this.certificationData);
        this.AcceptConditionsRule();
      }
    });
  }

  /**
   * Método para mostrar regla para preguntar si cliente acepta las condiciones
   * @author CINDY PANCHE - 16 Sep 2021
   */
  private AcceptConditionsRule(): void {
    this.certificationData.print = false;
    this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'AceptaCondiciones'
    }).afterClosed().subscribe(resp => {
      if (resp !== undefined && resp.value === 'SI') {
        this.certificationData.print = true;
        this.certificationData.nextMethod = 'PrintMessage';
        this.crmUtilService.SaveStepEntity('PRINT', this.certificationData);
        this.PrintMessage();
      } else if (resp !== undefined) {
        this.certificationData.nextMethod = 'NoCostKB';
        this.crmUtilService.SaveStepEntity('KB_NO_COST', this.certificationData);
        this.NoCostKB();
      }
    });
  }

  /**
   * Método para mostrar mensaje informativo para imprimir
   * @author CINDY PANCHE - 16 Sep 2021
   */
  private PrintMessage(): void {
    if (!this.dialog.getDialogById('dialogCert')) {
      this.certificationData.nextMethod = 'goToDynamicDocumentByData';
      this.crmUtilService.SaveStepEntity('M_CERTIFICATE_PRINT', this.certificationData);
      this.goToDynamicDocumentByData();
    }
    this.crmUtilService.showModal(this.certificationData.messages.paramClassFlujos?.find(x=> x.id === 'imprimirCertificado').text, true);
  }

  /**
   * Método para mostrar base de conocimiento 'NO_COSTO'
   * @author CINDY PANCHE - 17 Sep 2021
   */
  private NoCostKB(): void {
    this.knowledgeBaseLib.searchByNameScript('NO_COSTO');
    this.knowledgeBaseLib.openKnowledgeBaseModal({ btnCancel: false, titleScript: false }).then(respBase => {
      if (respBase) {
        this.certificationData.nextMethod = 'showEmailModal';
        this.crmUtilService.SaveStepEntity('M_EMAIL', this.certificationData);
        this.showEmailModal();
      }
    });
  }

  /**
   * Método para mostrar regla para preguntar si cliente se encuentra satisfecho con info recibida
   * @author CINDY PANCHE - 16 Sep 2021
   */
  private SatisfiedCustomerRule(): void {
    this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'ClienteSatisfechoInformacion'
    }).afterClosed().subscribe(resp => {
      if (resp !== undefined && resp.value === 'SI') {
        this.certificationData.nextMethod = 'EndAttention';
        this.crmUtilService.SaveStepEntity('END_ATTENTION', this.certificationData);
        this.EndAttention();
      } else if (resp !== undefined) {
        this.certificationData.nextMethod = 'CaseKB';
        this.crmUtilService.SaveStepEntity('KB_CASE', this.certificationData);
        this.CaseKB();
      }
    });
  }

  /**
   * Método para mostrar base de conocimiento 'ESCALAR_CASO'
   * @author CINDY PANCHE - 16 Sep 2021
   */
  private CaseKB(): void {
    this.knowledgeBaseLib.searchByNameScript('ESCALAR_CASO');
    this.knowledgeBaseLib.openKnowledgeBaseModal({ btnCancel: false, titleScript: false }).then(respBase => {
      if (respBase) {
        this.certificationData.nextMethod = 'EndAttention';
        this.crmUtilService.SaveStepEntity('END_ATTENTION', this.certificationData);
        this.EndAttention();
      }
    });
  }

  /* Método para validar respuesta de servicio notification
   * @author CINDY PANCHE - 16 Sep 2021
   */
  private NotificationSent(response: ResponseNotification): void {
    if (Boolean(response.isValid)) {
      this.certificationData.nextMethod = 'SatisfiedCustomerRule';
      this.crmUtilService.SaveStepEntity('RL_SATISFIED', this.certificationData);
      this.SatisfiedCustomerRule();
    } else {
      this.crmUtilService.showModal('Error al realizar notificación: ' + response.message, false);
    }
  }

  /* Método para mostrar mensaje de finalice atención
   * @author CINDY PANCHE - 16 Sep 2021
   */
  private EndAttention(): void {
    this.crmUtilService.showModal(this.certificationData.messages.paramClassFlujos?.find(x=> x.id === 'closeAT').text, true);
  }


  /* Método para lectura de pasos
   * @author CINDY PANCHE - 17 Sep 2021
   */
  private CheckSteps(): void {
    let lstData: LstData;
    if (this.responseLastStep.ACTION === 'CUENTASALDIA') {
      for (let step of this.stepCAD.steps) {
        lstData = this.responseLastStep.lstData.find(x => x.NAME_DATA == step);
        if (lstData !== undefined) break;
      }
      if (lstData !== undefined) {
        this.certificationData = JSON.parse(lstData.VALUE_DATA);
        if (this.certificationData.nextMethod !== undefined && this.certificationData.nextMethod !== '') { this[this.certificationData.nextMethod](); }
      } else {
        if (sessionStorage.getItem('documentType') == 'NI') {
          this.crmUtilService.showModal('Solo se generan certificaciones de cuenta al día para persona natural, por favor finalizar atención.', false);
        }
      }
    }
  }

  /**
   * Método para retornar a la URL Externa, cuando se llega al flujo por redireccionamiento.
   * @author SANTIAGO VALENCIA - 28 Dic 2021
   */
   ExternalURLReturn() {
    const dialogInfo = this.dialog.open(ModalInformativoComponent, {
      disableClose: true,
      data: 'Será redireccionado al micrositio anterior.',
      id: 'modalAlerta',
    });
    dialogInfo.afterClosed().subscribe(resp => {
      document.location.href = decodeURIComponent(this.externalURLReturnLocal);
    });
  }

}

export interface subscripcion {
  id: string[];
  serviceName: string[];
  detail: boolean;
}
