import { RequestCloseTransaction } from './../../../models/closeTransaction';
import { ModalMicrositesComponent } from './../../../shared/microsites-modal/microsites-modal.component';
import { environment } from 'src/environments/environment';
import { Component, OnInit, AfterContentChecked, OnDestroy } from '@angular/core';
import { SimpleGlobal } from 'ng2-simple-global';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { WsSoapService, DataTransform } from 'ws-soap-lib';
import { ActivatedRoute, Router } from '@angular/router';

import { Guarantee } from './../../../models/guarantee';
import { TraceabilityOtp } from './../../../services/traceabilityOtp.service';
import { CrmutilService } from './../../../services/crmutil.service';
import { RequestTraceabilityOtp } from 'src/app/models/traceabilityOtp';
import { ResponseCustomerTransaction, RequestCustomerTransaction } from 'src/app/models/customerTransaction';
import { ChannelTypeCodes, RequestPresencialBizInteraction, ResponseGetBizInteraction } from 'src/app/models/bizinteractions';
import { ExternalService } from './../../../services/external.service';
import { InternalCaseValues } from 'src/app/models/internalCase';
import { Util } from 'src/app/shared/util';
import { CustomService } from './../../../services/custom.service';
import { ImeiToolsService } from 'src/app/services/imeitools.service';
import { TypeDocument } from 'src/app/models/documentType';
import { numeric, alphaNumeric } from 'src/app/shared/custom-validator';
import { GetCaseRequest, GetCaseResponse, InternalCaseResponse, Warranty, WarrantyItem } from 'src/app/models/case';
import { DecisionTableModalComponent } from 'src/app/shared/decision-table-modal/decision-table-modal.component';
import { ODSRequest, StepOds, FormatTemplate, ODSStates, RepairState, ODSResponse, Ods, OdsStepTable, TypePayment, ModalityCav } from './../../../models/ods';
import { Parameter, ResponseParameter, RequestParameter } from './../../../models/parameter';
import { InformativeModalComponent } from 'src/app/shared/informative-modal/informative-modal.component';
import { InternalCaseDetailComponent } from 'src/app/Modules/internalcases/detail/internal-case-detail.component';
import { DeviceDetailComponent } from 'src/app/Modules/inventory/detail/device-detail/device-detail.component';
import { DataKnowledgeBase } from 'src/app/models/knowledgeBase';
import { Service, SubscriberPackages } from './../../../models/subscriberPackages';
import { CustomerOrder } from './../../../models/customerBacklogOrder';
import { SubscriptionsListComponent } from './../../subscriptionslist/subscriptionslist.component';
import { LstData, ResponseLastStep } from './../../../models/systemdata';
import { InventoryLoanAmountRequest, InventoryLoanAmountResponse } from 'src/app/models/inventoryLoanAmount';
import { CatalogManagementRequest, CatalogManagementResponse } from './../../../models/catalogManagement';
import { CreateOCCComponent } from './../../occ/create/create-occ.component';
import { Device } from 'src/app/models/device';
import { WarrantyService } from 'src/app/services/warranty.service';
import { ConsultaCimMessageResponse } from '../../../models/consultaCim';
import { Message_Type } from '../../../models/notification';
import { SendemailComponent } from '../../serviceorder/sendemail/sendemail.component';
import { KnowledgeBaseLibService } from 'knowledge-base-lib';
import { CashPayInvoice, CashPaymentValidation, Invoice } from '../../../models/invoice';
import { CavServiceResponse } from '../../../models/cav';
import { CashpaymentinvoiceComponent } from 'src/app/shared/cashpaymentinvoice/cashpaymentinvoice.component';
import { PDFFormatService } from '../../../services/pdf-format.service';
import { zip } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { InventoryCreateOrderReturnRequest, SapInventoryRequest } from '../../../models/sapInventory';
import { HEADER_REQUEST } from 'src/app/models/headerRequest';
import { CstVerifyPaymentRequest, ResponseInvoice, RpQuery } from 'src/app/models/generic';
import { NewEquipment } from 'src/app/models/warranty-ods';
import { DeliveryTimeService } from './../../../services/delivery-time.service';
import { BilledChargesModalComponent } from 'src/app/shared/billed-charges-modal/billed-charges-modal.component';
import { Attach, HeaderSMTP, MessageBox, MessageBox2, RequestNotificationSMTP, RootObjectSMTP } from './../../../models/notification';
import { ShoppingcartitemclsComponent } from '../../../Modules/shoppingcart/shoppingcart.component';
import { ItemSC, ResponseSCToken } from './../../../models/shopping-cart.interface';
import { ContextAttribute } from '../../../models/contextAttribute';

@Component({
  selector: 'app-consult-internal-case',
  templateUrl: './consult-internal-case.component.html',
  styleUrls: ['./consult-internal-case.component.scss']
})

export class ConsultInternalCaseComponent implements OnInit, OnDestroy, AfterContentChecked {

  public guarantee = new Guarantee();
  public internalCaseValues = new InternalCaseValues();
  public emptyValues = false;
  public documentTypes: TypeDocument[];
  public internalCaseForm: FormGroup;
  public displayedColumns: string[] = ['documentType', 'documentNumber', 'imei', 'serial', 'odsId', 'fechaRadicacion', 'tipoCaso', 'estado', 'modificationStateDate', 'fechaRespuesta', 'diasEstadoActual', 'tsc', 'detail'];
  public listCases: MatTableDataSource<InternalCaseResponse>;

  private traceability = { error: false } as RequestTraceabilityOtp;
  private requestCustomerTransaction = new RequestCustomerTransaction();
  private requestBizInt = new RequestPresencialBizInteraction();
  private responseBI: ResponseGetBizInteraction;
  private util = new Util(this.dialog);
  private parameters: Parameter;
  private odsRequest: ODSRequest;
  private caseResponse: GetCaseResponse;
  private servicesList: SubscriberPackages[];
  private customerBOList: CustomerOrder[];
  private formData = new FormData();
  private responseLastStep: ResponseLastStep;
  private dataKnowledgeBase = { strNameFunctionality: 'WARRANTY48', strNameProcess: 'BEGIN', affirmative: 'ACEPTAR' } as DataKnowledgeBase;
  private listWarranty: Warranty[];
  public listCaseStates: WarrantyItem[];
  private listCst: WarrantyItem[];
  private typingCases: WarrantyItem[];
  private reqParameter: RequestParameter;
  public disabledQuery: boolean = false;
  private disableDocumentInfo: boolean;
  private odsResponse: ODSResponse
  public listODS: MatTableDataSource<OdsStepTable>;
  public listOdsStep: OdsStepTable[];
  private checkedCav: boolean = false;
  private customerTrsc: ResponseCustomerTransaction;
  private responseQueryByMin = new Array<RpQuery>();
  public currentYear;

  get f() { return this.internalCaseForm.controls; }

  constructor(
    private dialog: MatDialog,
    private traceabilityWs: TraceabilityOtp,
    private sg: SimpleGlobal,
    private crmUtilService: CrmutilService,
    private externaslService: ExternalService,
    private custom: CustomService,
    private imeiTools: ImeiToolsService,
    private formBuilder: FormBuilder,
    private wsSoapService: WsSoapService,
    private warrantyService: WarrantyService,
    private _router: Router,
    private route: ActivatedRoute,
    private libknowledgeBase: KnowledgeBaseLibService,
    private pdfFormat: PDFFormatService,
    private deliveryTimes: DeliveryTimeService
    //private shoppingCartService: ShoppingCartService
  ) {
    this.route.queryParams.subscribe(params => {
      params['storer'] === 'true' ? this.guarantee.originStorer = true : this.guarantee.originStorer = false;
    });
    this.custom.ODCGenerated().subscribe(method => this.ODCGenerated())
    this.custom.GetBase64FileToSend().subscribe(file => this.objODSBase64(file));
    this.custom.EndTransactionStorer().subscribe(close => this.CloseTransaction());
    this.disableDocumentInfo = !this._router.url.includes('query')
    // this.disableDocumentInfo =  false // QUEMADO
  }

  ngOnDestroy(): void {
    setTimeout(() => {
      console.log('Clear all sessionstorage')
      sessionStorage.clear()
    }, 100)
  }

  ngOnInit() {
    this.GetDatosPostM();
    this.SetValuesInternalCase();
    if (!this.guarantee.originStorer) {
      this.SetDocumentValidators();
    }
    this.SetKnowledgeBase('WARRANTY48', 'BEGIN');

    var today = new Date();
    this.currentYear = today.getFullYear();
  }

  ngAfterContentChecked(): void {
    this.warrantyService.GetListRules();
    this.LoadSessionStorage();
  }
  private SetKnowledgeBase(nameFunctionality: string, nameProcess: string): void {
    const url = this.util.StringFormat(environment.urlCrmUtils, 'KnowledgeBase/GetKnowledgeBaseByFuncProc', 'strNameFunctionality=' + nameFunctionality + '&strNameProcess=' + nameProcess);
    this.libknowledgeBase.fetchKnowledgeBase(url, false);
  }

  //Método para inicializar form
  private SetValuesInternalCase() {
    let setForm = () => {
      this.guarantee.internalCase.tipoDocumento = this.getRightDocumentType()
      this.guarantee.documentTypeCode = this.guarantee.internalCase.tipoDocumento ? this.guarantee.internalCase.tipoDocumento : this.guarantee.documentTypeCode
      this.internalCaseForm = this.formBuilder.group({
        documentType: [{ value: this.guarantee.internalCase.tipoDocumento, disabled: this.disableDocumentInfo }, [Validators.required]],
        documentNumber: [{ value: this.guarantee.internalCase.numeroDocumento, disabled: this.disableDocumentInfo }, [Validators.required]],
        imei: [this.guarantee.internalCase.imei, [Validators.maxLength(15), Validators.minLength(15)]],
        serial: [this.guarantee.internalCase.serial],
        idInternalCase: [this.guarantee.internalCase.idInternalCase],
        state: [this.guarantee.internalCase.state],
        idOds: [this.guarantee.internalCase.idOds, [Validators.maxLength(16), Validators.minLength(16)]]
      });
    }

    if (!this.documentTypes && this.guarantee?.internalCase?.tipoDocumento) {
      this.imeiTools.GetDocumentsList().then(respDoc => {
        this.documentTypes = respDoc;
        setForm()
      });
    } else setForm()
  }

  private getRightDocumentType(): string {
    if (this.guarantee.internalCase.tipoDocumento &&
      !isNaN(Number(this.guarantee.internalCase.tipoDocumento)))
      return this.documentTypes.find(x => x.Id == this.guarantee.internalCase.tipoDocumento).Code
    return this.guarantee.internalCase.tipoDocumento
  }

  //Método para validar caracreres al oprimir tecla
  public OnKeyUp(box: string) {
    let val = this.internalCaseForm.get(box).value;
    this.internalCaseValues[box] = false;
    if (val && val !== "" && !val.toString().match(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s\.\,]+$/g)) {
      this.internalCaseValues[box] = true;
    }
    this.cleanInputs(box)
  }

  private cleanInputs(box: string) {
    const boxes = ['serial', 'imei', 'idInternalCase', 'state', 'idOds']
    boxes.forEach(x => {
      if (x !== box) this.internalCaseForm.get(x).setValue('')
    })
  }

  // Método para cargar sessionStorage
  private LoadSessionStorage(): void {
    let dataEmail = this.guarantee.email === '' ? this.guarantee.odsResponses[0].client.email : this.guarantee.email;
    sessionStorage.setItem('dataEmail', dataEmail);

    if (sessionStorage.length > 2 && this.guarantee.loadSession == false && this.guarantee.originStorer) {
      let data: any;
      data = sessionStorage.getItem('user');
      if (data != undefined) { this.guarantee.idUser = data; }
      data = sessionStorage.getItem('nombrePerfil');
      if (data != undefined) { this.guarantee.nameProfile = data; }
      data = sessionStorage.getItem('urlReturn');
      if (data != undefined) { this.guarantee.URLReturn = data; }
      this.guarantee.loadSession = true;
      //(this.guarantee.nameProfile !== undefined && this.guarantee.nameProfile.toUpperCase().includes('ALMACENISTA')) ? this.ValidateFormLists() : this.AdviseNotProfile();
      (this.guarantee.nameProfile !== undefined) ? this.ValidateFormLists() : this.AdviseNotProfile();

    } else if (sessionStorage.length > 2 && this.guarantee.loadSession == false) {
      let data: any;
      data = sessionStorage.getItem('user');
      if (data != undefined) { this.guarantee.idUser = data; }
      data = sessionStorage.getItem('idTurn');
      if (data != undefined) { this.guarantee.idTurn = data; }
      data = sessionStorage.getItem('documentType');
      if (data != undefined) {
        this.guarantee.documentTypeCode = data;
        this.guarantee.internalCase.tipoDocumento = data;
        this.guarantee.internalCase.documentType = data;
        this.internalCaseForm.get('documentType').setValue(data);
      }
      data = sessionStorage.getItem('idHeader');
      if (data != undefined) { this.guarantee.biHeaderId = data; }
      data = sessionStorage.getItem('source');
      if (data != undefined) { this.guarantee.source = data; }
      data = sessionStorage.getItem('urlReturn');
      if (data != undefined) { this.guarantee.URLReturn = data; }
      data = sessionStorage.getItem('account');
      if (data != undefined) { this.guarantee.account = data; }
      data = sessionStorage.getItem('min');
      if (data != undefined) { this.guarantee.min = data; }
      data = sessionStorage.getItem('channelTypeCode');
      if (data != undefined) { this.guarantee.tchannel = data; }
      data = sessionStorage.getItem('codeCav');
      if (data != undefined) { this.guarantee.codeCav = data; }
      data = sessionStorage.getItem('addressId');
      if (data != undefined) { this.guarantee.idAddress = data; }
      data = sessionStorage.getItem('name');
      if (data != undefined) { this.guarantee.name = data; }
      data = sessionStorage.getItem('surname');
      if (data != undefined) { this.guarantee.surname = data; }
      data = sessionStorage.getItem('type');
      if (data != undefined) { this.guarantee.type = data; }
      data = sessionStorage.getItem('documentNumberAdvisor');
      if (data != undefined) { this.guarantee.documentNumberAdvisor = data; }
      data = sessionStorage.getItem('idUser');
      if (data != undefined) { this.guarantee.user = data; }

      if (this.guarantee.surname === undefined && sessionStorage.getItem('surname ') !== undefined) { this.guarantee.surname = sessionStorage.getItem('surname ') }
      data = sessionStorage.getItem('documentNumber');
      if (data != undefined) {
        this.guarantee.documentNumber = data;
        this.guarantee.internalCase.numeroDocumento = data;
        this.guarantee.internalCase.documentNumber = data;
        this.internalCaseForm.get('documentNumber').setValue(data);
      }
      if (this.guarantee.documentNumber && this.guarantee.documentTypeCode) {
        this.guarantee.loadSession = true;
        this.CreateTransaction()
      }
      sessionStorage.removeItem('paymentVerified')
    }
  }
  //Metodo para validar listas de documentos y listados internos cuando entra por almacenista, sin iniciar transacció
  private ValidateFormLists() {
    this.crmUtilService.SetParametersGroup('48');
    this.crmUtilService.CompleteParametersGroup('C5_C11').then(r => {
      this.custom.SetParametersGroup(r);
      this.parameters = this.custom.GetParametersGroup();
      this.warrantyService.GetLists().then(() => {
        this.listWarranty = this.warrantyService.GetListWarranty();
        this.imeiTools.GetDocumentsList().then(respDoc => {
          this.documentTypes = respDoc;
          this.ShowCaseQuery();
        });
      });
    });
  }
  private AdviseNotProfile() {
    this.crmUtilService.SetParametersGroup('48');
    this.crmUtilService.CompleteParametersGroup('C5_C11').then(r => {
      this.parameters = this.custom.GetParametersGroup();
      const dialogRef = this.dialog.open(InformativeModalComponent, {
        disableClose: true,
        data: this.parameters.WARRANTY_MESSAGES.NotProfileAuthorized,
        id: 'fail-alert',
      });
      dialogRef.afterClosed().subscribe(resp => {
        if (resp) {
          this.CloseTransaction();
        }
      });
    });
  }

  /// Método para recibir datos por postmessage
  private GetDatosPostM(): void {
    window.sessionStorage.clear();
    window.onload = () => {
      let mensaje: any;
      function reciber(e) {
        mensaje = e.data;
        if (typeof mensaje !== 'object') {
          const datosRec = mensaje.split(',');
          for (var i = 0; i < datosRec.length; i++) {
            const valor = datosRec[i].split(':');
            window.sessionStorage.setItem(valor[0], valor[1]);
          }
        }
      }
      window.addEventListener('message', reciber);
    };
  }


  // Método para crear transacción
  private CreateTransaction(): void {
    this.parameters = this.custom.GetParametersGroup();
    this.guarantee.strXmlPaymentService = this.parameters.URLSERVICIOSG.WsPaymentServiceOrder.Xml;
    if (this.guarantee.originStorer) { this.ValidateCustomerTransaction(); }
    else {
      this.guarantee.idFlow = this.parameters.FLUJOS_SERVICIOS.FLUJOS_SERVICIOS.garantias48;
      this.OpenInteraction();
      this.requestCustomerTransaction.idFlow = this.guarantee.idFlow;
      this.requestCustomerTransaction.idTurn = this.guarantee.idTurn;
      this.requestCustomerTransaction.typeDocument = this.guarantee.documentTypeCode;
      this.requestCustomerTransaction.numberDocument = this.guarantee.documentNumber;
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CreateTransaction - CreateTransaction', dataTraza: this.requestCustomerTransaction });

      this.crmUtilService.CreateTransaction(this.requestCustomerTransaction)
        .subscribe(data => this.customerTrsc = data,
          (error) => {
            this.util.OpenAlert('El servicio (CreateTransaction) esta respondiendo con el siguiente error: ' + error.name, false);
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CreateTransaction - CreateTransaction', error: true, valueTraza: this.customerTrsc });
            this.custom.SetMessageError = 'Error al crear transacción ';
          },
          () => {
            this.sg['guid'] = this.customerTrsc.Guid;
            this.guarantee.guid = this.customerTrsc.Guid;
            console.log('GUID: ' + this.customerTrsc.Guid, ' ', this.customerTrsc.StateTransaction);
            if (this.customerTrsc.StateTransaction.toUpperCase() === 'NEW') {
              this.crmUtilService.SaveStep(this.guarantee, decodeURIComponent(this.guarantee.URLReturn));
              // if (this.guarantee.tchannel != ChannelTypeCodes.Presencial || this.guarantee.idTurn == '0') this.ValidateCustomerTransaction();//this.AlertNotPresencial();
              if (this.guarantee.tchannel == ChannelTypeCodes.Presencial) this.ValidateCustomerTransaction();//this.AlertNotPresencial();
              else if (this.guarantee.tchannel == ChannelTypeCodes.Telephone) this.ValidateCustomerTransaction();
              else this.ValidateCustomerTransaction();
            } else {
              this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CreateTransaction - GetLastSetpByTransaction', dataTraza: 'strGuid=' + this.guarantee.guid });
              this.crmUtilService.GetLastSetp(this.guarantee.guid)
                .subscribe(
                  responseLast => {
                    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CreateTransaction - GetLastSetpByTransaction', valueTraza: responseLast });
                    this.responseLastStep = responseLast;
                    // if (this.guarantee.tchannel != ChannelTypeCodes.Presencial || this.guarantee.idTurn == '0') this.CheckSteps();//this.AlertNotPresencial();
                    if (this.guarantee.tchannel == ChannelTypeCodes.Presencial) this.CheckSteps();//this.AlertNotPresencial();
                    else if (this.guarantee.tchannel == ChannelTypeCodes.Telephone) this.CheckSteps();
                    else this.CheckSteps();
                  },
                  error => {
                    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CreateTransaction - GetLastSetpByTransaction', error: true, valueTraza: error });
                  }
                );
            }
          }
        )
    }
  }
  private AlertNotPresencial() {
    this.getDataToSendNotification(this.guarantee.documentType, this.guarantee.documentNumber);
    const dialogRef = this.dialog.open(InformativeModalComponent, {
      disableClose: true,
      data: this.parameters.WARRANTY_MESSAGES.OnlyPresencialAttention,
      id: 'fail-alert',
    });
  }
  private ValidateCustomerTransaction(): void {
    this.warrantyService.GetLists().then(() => {
      this.listWarranty = this.warrantyService.GetListWarranty();
      this.imeiTools.GetDocumentsList().then(respDoc => {
        this.documentTypes = respDoc;
        this.guarantee.documentType = this.documentTypes?.find(x => x.Code === this.guarantee.documentTypeCode || x.Id == this.guarantee.documentTypeCode).Id
        this.getDataToSendNotification(this.guarantee.documentType, this.guarantee.documentNumber)
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CreateTransaction - CreateTransaction', valueTraza: this.customerTrsc });
        if (this.customerTrsc?.StateTransaction.toUpperCase() == 'NEW') {
          //condicional para validar si es inspira u op actual
          //evalua el parametro y si es operacion actual el  booleano sera true si es op inspira sera false
          this.guarantee.boolSourceOriginCurrentOperation = this.parameters.CLIENT_TRANSACTION_SOURCE.find(origin => origin.source === this.guarantee.source.toUpperCase()).opActual;
          this.guarantee.boolSourceOriginCurrentOperation ? this.GetCustomerByMin() : this.SetRequestSubscriberPackages();
        }
        if (this.guarantee.originStorer) this.ConsultCase();
      });
    });
  }

  private getDataToSendNotification(documentId: string, documentNumber: string) {
    this.imeiTools.consultaCim(documentId, documentNumber).subscribe((res) => {
      let response: ConsultaCimMessageResponse = JSON.parse(res.message);
      const { doNotEmail, doNotSMSInstantMessaging, email, phoneNumber } = response
      this.guarantee.email = email
      this.guarantee.phoneNumber = phoneNumber
      this.guarantee.notificationPreference = ((doNotEmail === 'false' && doNotSMSInstantMessaging === 'false')
        || (doNotEmail === 'true' && doNotSMSInstantMessaging === 'false'))
        ? 'MIN' : 'EMAIL'
      this.CloseAttention();
      this.crmUtilService.SaveStep(this.guarantee);
    });
  }
  private GetCustomerByMin(): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'WsPostSale-QueryDataMin', dataTraza: this.guarantee.min });
    this.imeiTools.GetCustomerByMin(this.guarantee.min).subscribe(respQueryDataMin => {
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'WsPostSale - QueryDataMin', valueTraza: respQueryDataMin });

      if (respQueryDataMin.isValid) {
        this.responseQueryByMin = JSON.parse(respQueryDataMin.message);
        if (this.responseQueryByMin.length > 0) {
          this.guarantee.customerId = this.responseQueryByMin[0].CUSTOMER_ID;
          this.ShowCaseQuery();
        } else {
          this.util.OpenAlert(this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.NotAssociatedInformation, 'CustomerId '), false)
        }
      }
      else {
        this.util.OpenAlert(this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.ServiceNotAvailable, ' QueryDataMin') + respQueryDataMin.message, false)
      }
    })
  }

  // Método para abrir interacción
  private OpenInteraction(): void {
    this.requestBizInt = new RequestPresencialBizInteraction();
    this.requestBizInt.idEvent = this.parameters.AP_CR_TURNOS.AP_CR_TURNOS.apertura;
    // if (this.guarantee.idTurn !== '' && this.guarantee.idTurn !== undefined && this.guarantee.idTurn !== '0') {
    if (this.guarantee.tchannel == ChannelTypeCodes.Presencial) {
      this.requestBizInt.idTurn = this.guarantee.idTurn;
      this.guarantee.presencialchannel = true;
    } else {
      this.guarantee.presencialchannel = false;
    }
    this.requestBizInt.channelTypeCode = this.guarantee.tchannel;
    this.requestBizInt.accountCode = this.guarantee.account;
    this.requestBizInt.userSignum = this.guarantee.idUser;
    this.requestBizInt.presencialChannel = this.guarantee.presencialchannel;
    this.requestBizInt.customerCode = this.guarantee.documentNumber + this.guarantee.documentTypeCode;
    this.requestBizInt.biHeaderId = this.guarantee.biHeaderId;
    this.requestBizInt.executionDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();
    this.requestBizInt.interactionDirectionTypeCode = '0';
    this.requestBizInt.service = this.guarantee.idFlow;
    this.requestBizInt.domainName = this.guarantee.source;
    sessionStorage.setItem("domainName", this.guarantee.source);
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'OpenInteraction - setPresencialBizInteraction', dataTraza: this.requestBizInt });
    this.externaslService.SetPresencialBizInteraction(this.requestBizInt).subscribe(respBiz => {
      this.responseBI = respBiz;
      try {
        const respBi = JSON.parse(this.responseBI.message);
        this.guarantee.idBizInteraction = respBi.id;
      }
      catch (error) {
        this.guarantee.idBizInteraction = '';
      }
      this.CloseAttention();
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'OpenInteraction - setPresencialBizInteraction', valueTraza: this.responseBI });
    }, (error) => {
      this.util.OpenAlert('El servicio (RequestPresencialBizInteraction) esta respondiendo con el siguiente error: ' + error.name, false);
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'OpenInteraction - setPresencialBizInteraction', error: true, valueTraza: error });
      this.custom.SetMessageError = 'Error al iniciar turno ';
    });
  }

  //Método para consultar componente de finalizar atención
  private CloseAttention(): void {
    let minShort = String(this.guarantee.min);
    if (minShort.length > 10) minShort = minShort.substring(minShort.length - 10, minShort.length);
    this.formData.append('idFlow', this.guarantee.idFlow);
    this.formData.append('documentType', this.guarantee.documentTypeCode);
    this.formData.append('documentNumber', this.guarantee.documentNumber);
    this.formData.append('idTurn', this.guarantee.idTurn);
    this.formData.append('idUser', this.guarantee.idUser);
    this.formData.append('Min', this.guarantee.min);
    this.formData.append('urlReturn', this.guarantee.URLReturn);
    this.formData.append('showCase', '1');
    this.formData.append('Name', this.guarantee.name);
    this.formData.append('lastName', this.guarantee.surname);
    this.formData.append('MailForResponse', this.guarantee.email);
    this.formData.append('redirectOutFrame', '1');
    this.formData.append('biHeaderId', this.guarantee.biHeaderId);
    this.formData.append('idBI', this.guarantee.idBizInteraction);
    this.formData.append('Type', this.guarantee.type);
    this.formData.append('numeroCuenta', this.guarantee.account);
    this.formData.append('channelTypeCode', String(this.guarantee.tchannel));
    this.formData.append('Account', this.guarantee.account);
    this.formData.append('accountCode', this.guarantee.account);

    this.sg['postCloseAttentionData'] = this.formData;
  }

  //Método para lectura de pasos
  private CheckSteps(): void {
    let lstData: LstData;
    if (this.responseLastStep.ACTION === 'GARANTIAS') {
      const lstDataSorted = this.responseLastStep.lstData.filter(x => Number(x.NAME_DATA) >= 0).sort(function (a, b) {
        if (Number(a.NAME_DATA) < Number(b.NAME_DATA)) { return 1; }
        if (Number(a.NAME_DATA) > Number(b.NAME_DATA)) { return -1; }
        return 0;
      });
      lstData = lstDataSorted[0];
      if (lstData !== undefined) {
        this.guarantee = JSON.parse(lstData.VALUE_DATA);
        if (this.guarantee.odsResponsews) { this.odsResponse = this.guarantee.odsResponsews; }
        if (this.guarantee.listWarranty !== undefined) { this.listWarranty = this.guarantee.listWarranty; this.getCurrentLists() }
        if (this.guarantee.showCaseQuery === undefined || !this.guarantee.showCaseQuery) { this.SetRequestSubscriberPackages(); }
        if (this.guarantee.nextMethod !== undefined) { this[this.guarantee.nextMethod](); }
        if (this.guarantee.internalCaseResponses !== undefined) { this.listCases = new MatTableDataSource(this.guarantee.internalCaseResponses); }
        if (this.guarantee.odsResponses !== undefined) { this.listODS = new MatTableDataSource(this.guarantee.odsResponses); }
        this.SetValuesInternalCase();
      } else {
        this.SetRequestSubscriberPackages();
      }
    }
    else {
      this.SetRequestSubscriberPackages();
    }
  }

  // Método para validar numeros de documentod e acuerdo al tipo
  private SetDocumentValidators(): void {
    const documentNumberControl = this.internalCaseForm.get('documentNumber');
    this.internalCaseForm.get('documentType').valueChanges
      .subscribe(documentType => {
        if (documentType === 'CC') { //CC
          documentNumberControl.setValidators([numeric, Validators.maxLength(11), Validators.minLength(6)]);
        } else if (documentType === 'CE') { // CEDULA EXTRANJERIA
          documentNumberControl.setValidators([alphaNumeric, Validators.minLength(3), Validators.maxLength(20)]);
        } else if (documentType === 'PS') { // PASAPORTE
          documentNumberControl.setValidators([alphaNumeric, Validators.minLength(3), Validators.maxLength(20)]);
        } else if (documentType === 'NI') { //NIT
          documentNumberControl.setValidators([numeric, Validators.minLength(9), Validators.maxLength(15)]);
        }
        documentNumberControl.updateValueAndValidity();
      });
  }

  // Método para preparar request de consumo para servicio de subscriberPackages
  private SetRequestSubscriberPackages(): void {
    if (!this.guarantee.documentType) {
      this.imeiTools.GetDocumentsList().then(response => {
        this.documentTypes = response;
        this.guarantee.documentType = this.documentTypes?.find(x => x.Code === this.guarantee.documentTypeCode || x.Id == this.guarantee.documentTypeCode).Id;
        this.SetRequestSubscriberPackages()
      });
    } else {
      const wsSubscriberP = this.parameters.URLSERVICIOSG.WsSubscriberP;
      let dataTransform = {
        arrayData: [
          // Header
          { name: 'idApplication', value: this.guarantee.idFlow },
          { name: 'startDate', value: this.util.ActualDate() },
          { name: 'userApplication', value: this.guarantee.idUser },
          // Body
          { name: 'identificationType', value: this.guarantee.documentType },
          { name: 'identificationNumber', value: this.guarantee.documentNumber }
        ]
      } as DataTransform;
      this.ConsumeSubscriptionService(wsSubscriberP.Url, wsSubscriberP.Xml, dataTransform, true);
    }
  }

  // Método para consultar servicios de Suscripciones(subscriberPackages/customerBacklogOrders)
  private ConsumeSubscriptionService(url: string, xmlString: string, data: DataTransform, isSubscriberP: boolean): void {
    this.listWarranty = this.warrantyService.GetListWarranty();
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeSubscriptionService - SubscriberPackages/CustomerBacklogOrders', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        this.wsSoapService.wsSoap(url, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeSubscriptionService - SubscriberPackages/CustomerBacklogOrders', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus['0']['status']['0']).toLowerCase() === "ok") {
                    if (isSubscriberP) { // SubscriberPackages
                      this.ValidateSubscription(jsonResponse);
                    } else { //CustomerBacklogOrders
                      this.ValidateCustomerBacklogOrders(jsonResponse);
                    }
                  } else {
                    this.util.OpenAlert('Error al consultar servicio para consulta de suscripción: ' + responseStatus['0']['message'] + '. ' +
                      this.parameters.WARRANTY_MESSAGES.EndAttention, false);
                  }
                }
              );
            } catch (error) {
              this.util.OpenAlert('Error al consultar servicio para consulta de suscripción: ' + error + '. ' +
                this.parameters.WARRANTY_MESSAGES.EndAttention, false);
            }
          }, (error) => {
            this.util.OpenAlert('El servicio (subscriberPackages) esta respondiendo con el siguiente error: ' + error.name, false);
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeSubscriptionService - SubscriberPackages/CustomerBacklogOrders', valueTraza: error, error: true });
            // this.util.OpenAlert(this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.ServiceNotAvailable,' SubscriberPackages -Consulta de suscripción'), false)
            this.custom.SetMessageError = 'Error en el servicio para consultar las suscripciones.';
          }
        );
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeSubscriptionService - SubscriberPackages/CustomerBacklogOrders', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio para consulta de suscripción: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);
      }
    );
  }

  // Método para validar respuesta de servicio de SubscriberPackages
  private ValidateSubscription(jsonResponse: string): void {
    this.wsSoapService.getObjectByElement(jsonResponse, 'servicesList').then(
      (responseServicesList) => {
        if (responseServicesList.length > 0) {
          this.servicesList = JSON.parse(JSON.stringify(responseServicesList));
          const service = this.servicesList[0].services.filter(x => x.servicesAccount[0].subscriberNumber && x.servicesAccount[0].subscriberNumber[0] === this.guarantee.min)[0];
          if (service !== undefined) {
            const status = service.servicesAccount[0].status[0];
            if (status === 'Suspended') {
              const listSubscription = this.servicesList[0].services[0].servicesAccount[0].subscriptionList[0].subscription;
              const fraud = listSubscription.filter(y => y.productCharacteristics.filter(z => z.name[0] === 'susByFraud'))[0];
              if (fraud !== undefined) {
                this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.Fraud + ' ' + this.parameters.WARRANTY_MESSAGES.EndAttention, false);
              } else {
                const type = this.servicesList[0].services[0].servicesAccount[0].type[0];
                if (type === '1' || type === '2' || type === '3') {
                  this.SetRequestCustomerBacklogOrders();
                } else {
                  this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.Notificacion + ' ' + this.parameters.WARRANTY_MESSAGES.EndAttention, false)
                }
              }
            } else {
              this.SetRequestCustomerBacklogOrders();
            }
          } else {
            this.util.OpenAlert('Datos de suscripción de cliente no encontrados. ' +
              this.parameters.WARRANTY_MESSAGES.EndAttention, false);
          }
        } else {
          this.util.OpenAlert('Datos de suscripción de cliente no encontrados. ' +
            this.parameters.WARRANTY_MESSAGES.EndAttention, false);
        }
      }, (error) => {
        this.util.OpenAlert('Datos de suscripción de cliente no encontrados: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.EndAttention, false);
      }
    );
  }


  // Método para preparar request de consumo para servicio de customerBacklogOrders
  private SetRequestCustomerBacklogOrders(): void {
    const wsCustomerB = this.parameters.URLSERVICIOSG.WsCustomerBO;
    let dataTransform = {
      arrayData: [
        // Header
        { name: 'idApplication', value: this.guarantee.idFlow },
        { name: 'startDate', value: this.util.ActualDate() },
        { name: 'userApplication', value: this.guarantee.idUser },
        // Body
        { name: 'documentType', value: this.guarantee.documentType },
        { name: 'documentNumber', value: this.guarantee.documentNumber }
      ]
    } as DataTransform;
    this.ConsumeSubscriptionService(wsCustomerB.Url, wsCustomerB.Xml, dataTransform, false);
  }

  // Método para validar respuesta de servicio de CustomerBacklogOrders
  private ValidateCustomerBacklogOrders(jsonResponse: string): void {
    this.wsSoapService.getObjectByElement(jsonResponse, 'customerOrder').then(
      (responseCustomerOrder) => {
        if (responseCustomerOrder.length > 0) {
          this.customerBOList = JSON.parse(JSON.stringify(responseCustomerOrder));
          const order = this.customerBOList.find(x => x.serviceOrders !== undefined && x.serviceOrders.find(y => y.resourceNumber[0] === this.guarantee.min));
          this.ValidateStateCustomerBacklogOrders(order, true);
        } else {
          this.util.OpenAlert('Datos de suscripciones del cliente no encontrados. ' +
            this.parameters.WARRANTY_MESSAGES.EndAttention, false);
        }
      }, (error) => {
        this.util.OpenAlert('Datos de suscripciones del cliente no encontrados: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.EndAttention, false);
      }
    );
  }

  // Método para validar estado de la orden filtrada de servicio CustomerBacklogOrders
  private ValidateStateCustomerBacklogOrders(order: CustomerOrder, showRule: boolean): void {
    if (!this.dialog.getDialogById('errorModal')) { //Si no hay abierto modal de error
      this.getCurrentLists();
      this.guarantee.listWarranty = this.listWarranty;
      if (order !== undefined) {
        if (order.biType[0] === 'Contract Handover' || order.biType[0] === 'Cancellation') {
          if (order.stateCode[0] === 'C_C' && order.stateDesc[0] === 'Completed') {
            showRule ? this.ContinueWithSubscriptionRule() : this.ShowCaseQuery();
          } else {
            this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.PendingOrder + ' ' + this.parameters.WARRANTY_MESSAGES.EndAttention, false);
          }
        } else {
          showRule ? this.ContinueWithSubscriptionRule() : this.ShowCaseQuery();
        }
      } else {
        this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.NoAssociatedOrder + ' ' + this.parameters.WARRANTY_MESSAGES.EndAttention, false);
      }
    }
  }

  // Método para mostrar regla para preguntar si cliente desea continuar con esa subscripcion
  private ContinueWithSubscriptionRule(): void {
    const dialogRef = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'ContinuarSuscripcion',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (resp.value === 'SI') {
          this.ShowCaseQuery();
        } else {
          this.ListSubscriptions();
        }
      }
    });
  }

  //Método para mostrar front de consulta de caso
  private ShowCaseQuery(): void {
    this.getCurrentLists();
    this.guarantee.listWarranty = this.listWarranty;
    this.guarantee.showCaseQuery = true;
    if (!this.guarantee.originStorer) this.crmUtilService.SaveStep(this.guarantee);
  }

  //Método para listar todas las suscripciones de un cliente que esten activas o que no sean suspendidas por fraude
  public ListSubscriptions(): void {
    const listServices = this.servicesList[0].services.filter(x => x.servicesAccount[0].status[0] === 'Active' ||
      x.servicesAccount[0].subscriptionList[0].subscription.filter(y => y.productCharacteristics.filter(z => z.name[0] !== 'susByFraud')));
    listServices.forEach(element => {
      element.servicesAccount[0].type[0] = this.parameters.SUBSCRIPTION_TYPE[element.servicesAccount[0].type[0]];
    });
    //Mostrar modal con listado de suscripciones
    const dialogRef = this.dialog.open(SubscriptionsListComponent, {
      disableClose: true,
      data: listServices,
      minWidth: '60%'
    });
    dialogRef.afterClosed().subscribe(service => {
      if (service !== undefined) {
        service === false ? this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.EndAttention, false) :
          this.ValidateSelectedSubscription(service);
      }
    });
  }

  //Método para validar si suscripcion seleccionada de listado es de tipo Cesión de contrato o Cancellation
  private ValidateSelectedSubscription(service: Service): void {
    const order = this.customerBOList.filter(x => x.serviceOrders !== undefined && x.serviceOrders[0].resourceNumber[0] === service.servicesAccount[0].subscriberNumber[0])[0];
    this.ValidateStateCustomerBacklogOrders(order, false);
  }

  get hasImeiErrors(): boolean { return Boolean(this.internalCaseForm.get('imei').errors) }

  // Método para validar valores necesarios para consultar caso
  public SubmitGetCase(): void {
    this.internalCaseValues.imei = this.hasImeiErrors
    this.guarantee.submitted = true;
    this.guarantee.internalCase.tipoDocumento = this.internalCaseForm.get('documentType').value;
    this.guarantee.internalCase.documentType = this.internalCaseForm.get('documentType').value;
    this.guarantee.internalCase.numeroDocumento = this.internalCaseForm.get('documentNumber').value;
    this.guarantee.internalCase.documentNumber = this.internalCaseForm.get('documentNumber').value;
    this.guarantee.internalCase.idInternalCase = this.internalCaseForm.get('idInternalCase').value;
    this.guarantee.internalCase.imei = this.internalCaseForm.get('imei').value;
    this.guarantee.internalCase.serial = this.internalCaseForm.get('serial').value;
    this.guarantee.internalCase.state = this.internalCaseForm.get('state').value;
    this.internalCaseForm.get('idOds').value ? this.guarantee.internalCase.idOds = this.internalCaseForm.get('idOds').value : this.guarantee.internalCase.idOds = undefined;
    if (this.internalCaseForm.invalid) {
      return;
    } else if ((this.guarantee.internalCase.idInternalCase !== undefined && this.guarantee.internalCase.idInternalCase !== null)
      || (this.guarantee.internalCase.tipoDocumento !== undefined && this.guarantee.internalCase.tipoDocumento !== null && this.guarantee.internalCase.tipoDocumento.trim() !== '')
      || (this.guarantee.internalCase.imei !== undefined && this.guarantee.internalCase.imei !== null && this.guarantee.internalCase.imei.trim() !== '')
      || (this.guarantee.internalCase.serial !== undefined && this.guarantee.internalCase.serial !== null && this.guarantee.internalCase.serial.trim() !== '')
      || (this.guarantee.internalCase.state !== undefined && this.guarantee.internalCase.state !== null && this.guarantee.internalCase.state.trim() !== '')
      || (this.guarantee.internalCase.numeroDocumento !== undefined && this.guarantee.internalCase.numeroDocumento !== null && this.guarantee.internalCase.numeroDocumento.trim() !== '')
      || (this.guarantee.internalCase.idOds !== undefined && this.guarantee.internalCase.idOds !== null && this.guarantee.internalCase.idOds.trim() !== '')) {
      this.emptyValues = false;
      if (this.guarantee.originStorer) {
        this.guarantee.documentTypeCode = this.internalCaseForm.get('documentType').value;
        this.guarantee.documentNumber = this.internalCaseForm.get('documentNumber').value;
        this.guarantee.idTurn = '0';
        const btnCloseAttention = (<HTMLInputElement>document.getElementById('btnEndAttention'));
        this.CreateTransaction();
      } else {
        // Perfil almacenista ?
        this.ConsultCase();
      }
    } else {
      this.emptyValues = true;
      return;
    }
  }

  private get getRequest(): GetCaseRequest {
    this.odsRequest = new ODSRequest();
    this.odsRequest.headerRequest = HEADER_REQUEST;
    this.odsRequest.documentType = this.guarantee.internalCase.documentNumber ? this.getIdTypeDocument(this.guarantee.internalCase.tipoDocumento) : null
    this.odsRequest.documentNumber = this.guarantee.internalCase.documentNumber ? this.guarantee.internalCase.documentNumber : null
    this.odsRequest.imei = this.guarantee.internalCase.imei;
    this.odsRequest.serial = this.guarantee.internalCase.serial;
    if (this.guarantee.internalCase.idOds) this.odsRequest.idOds = this.guarantee.internalCase.idOds;
    this.odsRequest.idInternalcase = this.guarantee.internalCase.idInternalCase ? Number(this.guarantee.internalCase.idInternalCase) : null;
    if (this.guarantee.internalCase.state) this.odsRequest.state = this.guarantee.internalCase.state;
    if (this.odsRequest.state) this.odsRequest.state = this.listCaseStates.find(x => x.name === this.odsRequest.state).id;


    let getCaseRequest = new GetCaseRequest();
    getCaseRequest.headerRequest = HEADER_REQUEST;
    if (this.odsRequest.documentType) getCaseRequest.documentType = this.odsRequest.documentType
    if (this.odsRequest.documentNumber) getCaseRequest.documentNumber = this.odsRequest.documentNumber
    if (this.odsRequest.imei) getCaseRequest.imei = this.odsRequest.imei
    if (this.odsRequest.serial) getCaseRequest.serial = this.odsRequest.serial
    if (this.odsRequest.idOds) getCaseRequest.idOds = this.odsRequest.idOds
    if (this.odsRequest.state) getCaseRequest.state = this.odsRequest.state
    if (this.odsRequest.idInternalcase) getCaseRequest.idInternalCase = this.odsRequest.idInternalcase
    return getCaseRequest
  }

  private ConsultCase(showMessageICClosed = true): void {
    const getCaseRequest = this.getRequest

    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsultCase - GetCase', dataTraza: this.odsRequest });

    zip(this.warrantyService.GetODS(this.odsRequest), this.externaslService.GetCase(getCaseRequest))
      .pipe(map(([ods, internalCases]) => {
        if (!internalCases.isValid) {
          this.util.OpenAlert(internalCases.message, false)
        } else {
          ods.odsResponse = ods.odsResponse.filter(x => x.idInternalCase)
          ods.odsResponse.forEach(odsItem => {
            // ESTA LINEA SE COLOCA YA QUE ALGUNAS VECES ESE CAMPO SE DESELECCIONA AL HACER EL CONSUMO DE LOS SERVICIOS
            this.internalCaseForm.controls['documentType'].setValue(this.guarantee.internalCase.tipoDocumento)
            if (internalCases.internalCaseResponse.length > 0) {
              const IC = internalCases.internalCaseResponse.find((ICItem) => Number(ICItem.idInternalCase) === Number(odsItem.idInternalCase))
              odsItem.typing = IC?.typing
              odsItem.daysCurrentState = IC?.daysCurrentState
            } else {
              const IC = internalCases.internalCaseResponse as unknown as InternalCaseResponse
              odsItem.typing = IC?.typing
              odsItem.daysCurrentState = IC?.daysCurrentState
            }
          })
          return ods
        }
      })).subscribe((ods) => {
        this.custom.DelCountError();
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsultCase - GetCase', valueTraza: ods });
        this.guarantee.odsResponsews = ods;
        this.odsResponse = ods;
        if (this.odsResponse.isValid) {
          if (this.odsResponse.odsResponse.length > 0) {
            this.listOdsStep = [];
            this.odsResponse.odsResponse.forEach(odsItemList => {
              //cambio parcial para pasos ... validar... completar con campos necesarios
              let dataTableItem: OdsStepTable = this.getDataTableItem(odsItemList)
              this.listOdsStep.push(dataTableItem);
            });
            this.listODS = new MatTableDataSource(this.listOdsStep);
            this.guarantee.odsResponses = this.listOdsStep;
            this.guarantee.showCaseTable = true;
            this.crmUtilService.SaveStep(this.guarantee);
            // STATE 4 == CERRADO == CL
            if (this.guarantee.selectedCase && this.guarantee.selectedCase.state === 4 && showMessageICClosed) {
              this.sg['closedCase'] = 'true';
              this.disabledQuery = true;
              const dialogRef2 = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.InternalCaseClosed);
              if (this.guarantee.originStorer) {
                dialogRef2.afterClosed().subscribe(resp => {
                  if (resp) {
                    this.CloseTransaction();
                  }
                });
              }
            }
          } else {
            this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.InfoNotFound, true);
            this.guarantee.showCaseTable = false;
          }
        } else {
          this.util.OpenAlert('Error al consultar caso.', false);
        }
      },
        error => {
          this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsultCase - GetCase', error: true, valueTraza: error });
          this.custom.AddCountError();
          if (this.custom.GetCountError() <= environment.ic) {
            this.ConsultCase(); //Vuelve a consumir el ws para que haya respuesta
          } else if (this.custom.GetCountError() > environment.ic) {
            this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.InformationError, false);
            this.guarantee.showCaseTable = false;
          }
        })
  }

  private getDataTableItem(odsItemList: Ods): OdsStepTable {
    let equipment = {
      keyboard: odsItemList.equipment.keyboard || 1,
      connectors: odsItemList.equipment.connectors || 1,
      screen: odsItemList.equipment.screen || 1,
      battery: odsItemList.equipment.battery || 1,
      batteryCover: odsItemList.equipment.batteryCover || 1,
      case: odsItemList.equipment.case || 1,
      charger: odsItemList.equipment.charger || 1,
      memoryCard: odsItemList.equipment.memoryCard || 1,
      freehands: odsItemList.equipment.freehands || 1,
      viewfinder: odsItemList.equipment.viewfinder || 1,
      speakers: odsItemList.equipment.speakers || 1,
      cpu: odsItemList.equipment.cpu || 1,
      mouse: odsItemList.equipment.mouse || 1,
      brand: odsItemList.equipment.brand || '',
      imei: odsItemList.equipment.imei || '',
      serial: odsItemList.equipment.serial || '',
      model: odsItemList.equipment.model || '',
      min: odsItemList.equipment.min || 0,
    }
    return {
      client: odsItemList.client,
      equipment,
      idOds: odsItemList.idOds,
      idInternalcase: odsItemList.idInternalCase,
      typing: odsItemList.typing,
      state: odsItemList.state,
      entryDate: odsItemList.entryDate,
      entryHour: odsItemList.entryHour,
      daysCurrentState: odsItemList.daysCurrentState,
      tsc: odsItemList.tsc,
      user: odsItemList.user,
      equipLoan: odsItemList.equipLoan,
      equipLoanI: odsItemList.equipLoanI,
      failure: odsItemList.failure,
      warrantyReplacement: odsItemList.warrantyReplacement,
      customerDeliversEquipmentCAV: odsItemList.customerDeliversEquipmentCAV,
      faultReported: odsItemList.faultReported,
      condition: odsItemList.condition,
      observationsD: odsItemList.observationsD,
      period: odsItemList.period,
      equipmentOnLoan: odsItemList.equipmentOnLoan,
      repairEquipmentWithCost: odsItemList.repairEquipmentWithCost,
      repairState: odsItemList.repairState,
      law1480Applies: odsItemList.law1480Applies,
      equipChange: odsItemList.equipChange,
      modificationStateDate: odsItemList.modificationStateDate
    }
  }

  public SelectedCase(selectedCase: Ods): void {
    this.guarantee.selectedCase = selectedCase;
    console.log('this.guarantee.nameCaseStateSelected', this.guarantee.selectedCase);

    if (this.guarantee.selectedCase.state != undefined) {
      this.guarantee.nameCaseStateSelected = this.listCaseStates.find(caseItem => caseItem.id === this.guarantee.selectedCase.state).name;

      // Recibido en domicilio - Recibido en punto de origen - Devolución de dinero - En reparación - Cambio de equipo - Reparado - Enviado a punto de origen
      const statesToValidate = [ODSStates.ReceivedHome, ODSStates.ReceivedOriginPoint, ODSStates.RefundMoney, ODSStates.InRepair, ODSStates.EquipmentChange, ODSStates.Repared, ODSStates.SentToSource]
      const exists = statesToValidate.find(x => x === this.guarantee.nameCaseStateSelected);

      if (this.guarantee.nameCaseStateSelected === ODSStates.Closed) {
        this.sg['closedCase'] = 'true'
        this.disabledQuery = true
        this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.InternalCaseClosed, true);
        return;
      } else if (!exists) {
        this.disabledQuery = true
        this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.InternalCaseClosed, false);
        return;
      }
      this.guarantee.nextMethod = 'ValidateCaseState';
      this.crmUtilService.SaveStep(this.guarantee);
      this.ValidateCaseState();
    } else {
      this.util.OpenAlert('No se encontró información de caso relacionada al cliente.', false);
    }
  }

  private ValidateCaseState(): void {
    //Obtengo ODS asociada al caso
    const selectedOds: Ods = this.odsResponse.odsResponse.find(ods => ods.idOds === this.guarantee.selectedCase.idOds)
    this.odsRequest = new ODSRequest();
    this.odsRequest.idOds = this.guarantee.selectedCase.idOds;
    if (selectedOds !== undefined) {
      let odsOfCase: StepOds = this.getOdsOfCase(selectedOds);
      this.guarantee.odsOfCase = odsOfCase;
      this.guarantee.nameCaseStateSelected = this.listCaseStates.find(caseItem => caseItem.id === this.guarantee.odsOfCase.state).name;
      const caseState = this.guarantee.nameCaseStateSelected;
      if (!this.guarantee.originStorer) {
        if (caseState === ODSStates.ReceivedHome) this.ReturnEquipmentRule();
        else if (caseState === ODSStates.ReceivedOriginPoint) this.ValidateTimeAtPointOfOrigin();
        else this.ValidateEquipmentOnLoan();
      } else {
        //Valida cuando tenga reparacion con costo actualiza sin cerrar caso
        // this.guarantee.odsOfCase.repairEquipmentWithCost = false; //QUEMADO
        this.guarantee.isCloseCase = true;
        this.guarantee.updateODS = true;
        if (this.guarantee.odsOfCase?.repairEquipmentWithCost) {
          this.guarantee.isCloseCase = false;
        }
        this.UpdateCaseManual();
      }
    }
  }

  private getOdsOfCase(selectedOds: Ods): StepOds {
    const currentDate = new Date();
    const currentDateFormated = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
    return {
      idOds: selectedOds?.idOds || '',
      imei: selectedOds?.equipment?.imei || '',
      entryDate: selectedOds?.entryDate || currentDateFormated,
      equipLoan: selectedOds?.equipLoan || false,
      equipLoanI: selectedOds?.equipLoanI || false,
      documentType: selectedOds?.client?.documentType || 1,
      documentNumber: selectedOds?.client?.documentNumber || '',
      repairEquipmentWithCost: selectedOds.repairEquipmentWithCost || false,
      repairState: selectedOds?.repairState || 1,
      equipChange: selectedOds?.equipChange || false,
      law1480Applies: selectedOds?.law1480Applies || false,
      doa: selectedOds?.doa || false,
      state: selectedOds.state || 0,
      enterWithAccessories: selectedOds.enterWithAccessories || false,
      accessoriesEntered: selectedOds.accessoriesEntered || [],
      serial: selectedOds?.equipment?.serial || '',
      period: selectedOds?.period || 0,
      failure: selectedOds.failure || '',
      warrantyReplacement: selectedOds.warrantyReplacement || false,
      customerDeliversEquipmentCAV: selectedOds.customerDeliversEquipmentCAV || false,
      faultReported: selectedOds.faultReported || 1,
      condition: selectedOds.condition || '',
      observationsD: selectedOds.observationsD || '',
      equipment: selectedOds.equipment,
      equipmentOnLoan: selectedOds.equipmentOnLoan
    }
  }

  // Método para mostrar regla para preguntar si cliente devolvió el equipo
  private ReturnEquipmentRule(): void {
    const dialogRef = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'DevolvioEquipo',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (resp.value === 'SI') {
          this.guarantee.inBadCondition = false;
          this.guarantee.nextMethod = 'UpdateCaseManual';
          this.guarantee.odsMethod = 'ReturnEquipmentRule';
          this.guarantee.isCloseCase = true;
          this.crmUtilService.SaveStep(this.guarantee);
          this.UpdateCaseManual();
        } else {
          this.guarantee.nextMethod = 'ValidateLoanedEquipmentTimes';
          this.guarantee.odsMethod = 'ReturnEquipmentRule';
          this.guarantee.inBadCondition = true;
          this.crmUtilService.SaveStep(this.guarantee);
          //evalua el parametro y si es operacion actual el  booleano sera true si es op inspira sera false
          this.guarantee.boolSourceOriginCurrentOperation ? this.ValidateLoanedEquipmentTimes() : this.ValidateLoanedEquipmentTimes();
        }
      }
    });
  }

  // Método para consumir el servicio SAPINVENTORY - INVENTORYCREATEORDERRETURN
  // Este servicio sirve para crear una nota crédito o anulación de factura para devolver el dinero al cliente y el ejecutar esa operación siempre retorna 0
  public InventoryCreateOrder(invoiceNumber: string, sapPositionNumber: string, fsPositionNumber: string, serialNumber: string): void {
    let response;
    var origFsPositionNumber = Number(fsPositionNumber) / 10;     
    const requestSapCreateOrder: InventoryCreateOrderReturnRequest = { headerRequest: HEADER_REQUEST, invoiceNumber: invoiceNumber, sapPositionNumber: sapPositionNumber, fsPositionNumber: origFsPositionNumber.toString(), serialNumber: serialNumber }
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'InventoryCreateOrder - PutSapCreateOrder', dataTraza: requestSapCreateOrder });
    this.externaslService.PutSapCreateOrder(requestSapCreateOrder).subscribe(
      datos => response = datos,
      (error) => {
        this.util.OpenAlert('El servicio (WsInventoryCreateOrder) esta respondiendo con el siguiente error: ' + error.name, false);
        this.custom.SetMessageError = 'Error al consultar servicio para conocer número de veces prestado el equipo ';
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'InventoryCreateOrder - WsInventoryCreateOrder', valueTraza: response });
      },
      () => {
        const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.InvoiceCancellation);
        dialogMsg.afterClosed().subscribe(resp=> {
          if (resp) {
              if (this.guarantee.positiveBalance) {
                this.guarantee.odsMethod = 'AfterValidatePaymentReferences'
                this.guarantee.nextMethod = 'CloseCase'
                this.crmUtilService.SaveStep(this.guarantee)
                const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.redirectMoneyRefound);
                dialogMsg.afterClosed().subscribe(resp => {
                  if (resp) {
                    this.sendMessage('Refund');
                    this.CloseCase()
                  }
                })
                this.disabledQuery = true;
              } else {
                this.guarantee.positiveBalance = false;
                const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.NotFavorBalance);//acae
                dialogRef.afterClosed().subscribe(resp => {
                  if (resp) {
                    this.guarantee.isCloseCase = true;
                    this.guarantee.nextMethod = 'UpdateCaseManual';
                    this.guarantee.odsMethod = 'AfterValidatePaymentReferences';
                    this.crmUtilService.SaveStep(this.guarantee);
                    this.UpdateCaseManual();
                  }
                });
              }            
          }
        })
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'InventoryCreateOrder - WsInventoryCreateOrder', valueTraza: response });
        console.log('InventoryCreateOrder', response)
      },
    );
  }

  //Método para validar numero de veces prestado un equipo, metodos para INS, y FS, instanciar y crear los respectivos en BSCS, RR
  private ValidateLoanedEquipmentTimes(): void {
    let response: InventoryLoanAmountResponse;
    const requestSapInventory: SapInventoryRequest = { headerRequest: HEADER_REQUEST, imei: this.getImeiConsultTransaction }
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateLoanedEquipmentTimes - PutSapInventoryInfo', dataTraza: requestSapInventory });
    this.externaslService.PutSapInventoryInfo(requestSapInventory).pipe(
      switchMap(responseSap => {
        responseSap?.materialNumber !== undefined && responseSap.materialNumber !== '' ? this.guarantee.productOfferingId = Number(responseSap?.materialNumber).toString() : this.guarantee.productOfferingId = undefined;
        const request: InventoryLoanAmountRequest = {
          serial: responseSap?.serialNumber || '0',
          sku: responseSap?.materialNumber ? Number(responseSap?.materialNumber).toString() : '0',
          user: this.guarantee.idUser
        }
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateLoanedEquipmentTimes - GetInventoryLoanAmoun', dataTraza: request });
        return this.externaslService.GetInventoryLoanAmoun(request)
      })
    ).subscribe(
      datos => response = datos,
      (error) => {
        this.util.OpenAlert('El servicio (WsSapInventory) esta respondiendo con el siguiente error: ' + error.name, false);
        this.custom.SetMessageError = 'Error al consultar servicio para conocer número de veces prestado el equipo ';
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'ValidateLoanedEquipmentTimes - GetInventoryLoanAmoun', valueTraza: response });
      },
      () => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateLoanedEquipmentTimes - GetInventoryLoanAmoun', valueTraza: response });
        this.guarantee.loanAmount = response.loanAmount;
        this.ValidateCatalogManagement();
      },
    );
  }
  private AlertNoProductOfferingToImei() {
    const alertMessage = this.parameters.WARRANTY_MESSAGES.NotProducOfferingIdToImei;
    const dialogInfo = this.dialog.open(InformativeModalComponent, {
      disableClose: true,
      data: alertMessage,
      id: 'fail-alert',
    });
  }

  // Método para validar costo de equipo en prestamo
  private ValidateCatalogManagement(): void {
    if (this.guarantee.productOfferingId === undefined) {
      this.AlertNoProductOfferingToImei();
    } else {
      let response: CatalogManagementResponse;
      const request: CatalogManagementRequest = {
        //Data quemada en parametro. Segun especificacion de documentacion y reuniones con dueños, son los parametros y el identificador del producto los que determinan su valores de cobro
        body: this.parameters.BODY_CATALOGMANAGEMENT,
        parameters: {
          id: 'PO_Equ' + this.guarantee.productOfferingId,
          idBusinessTransaction: this.guarantee.idBizInteraction,
          idApplication: this.guarantee.idFlow,
          userApplication: this.guarantee.idUser,
          startDate: this.util.ActualDate(),
          additionalNode: 'addNotes',
          target: 'ECM',
          channel: 'USSD',
          fields: 'id,name,description,productOfferingPrices'
        }
      }
      // request.parameters.id = 'PO_Equ70032987' // QUEMADO
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateCatalogManagement - CatalogManagement', dataTraza: request });
      this.externaslService.PostCatalogManagement(request).subscribe(
        datos => response = datos,
        (error) => {
          this.util.OpenAlert('El servicio (WsCatalogManagement) esta respondiendo con el siguiente error: ' + error.name, false);
          this.custom.SetMessageError = this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.NotAssociatedInformation, 'Identificador de producto en catalogo (PoID): ');
          this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'ValidateCatalogManagement - CatalogManagement', valueTraza: response });
        },
        () => {
          this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateCatalogManagement - CatalogManagement', valueTraza: response });
          if (response.getProductOfferingResponse.length > 0 && response.getProductOfferingResponse[0]?.versions[0]?.productOfferingPrices) {
            this.guarantee.costLoanEquipment = response.getProductOfferingResponse[0]?.versions[0]?.productOfferingPrices[0]?.versions[0]?.price?.amount;
            //const propayment = sessionStorage.getItem('propago');
            var propayment = 1; //se quema el valor linea propago por indicaciones y reuniones aun no se tiene el parametro propago en el sessionStorage
            if (propayment == 1) {
              this.guarantee.typePayment = TypePayment.LoanPayment;
              this.guarantee.totalcostLoanEquipment = this.guarantee.costLoanEquipment;

              const dialogPropayment = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ClientProPayment)
              dialogPropayment.afterClosed().subscribe(resp => {
                if (resp) {
                  this.externaslService.getSuccessFactorInfo(this.guarantee).then(res => {
                    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateCatalogManagement - getSuccessFactorInfo', valueTraza: res });
                    if (res) {
                      this.guarantee.successFactorInfo = res;
                      if (res.salePoint !== undefined && res.salePoint !== '' && res.salePoint !== null) {
                        // this.guarantee.successFactorInfo.salePoint = '300'// Quemado para cuando no se necesite cav
                        this.ValidateCallPaymentSGetCAV();
                      }
                    }
                  })
                }
              });
            } else {
              this.ValidateFinalCostLoanEquipment();
            }
          } else {
            const alertMessage = this.parameters.WARRANTY_MESSAGES.NotProductOffering;
            const dialogInfo = this.dialog.open(InformativeModalComponent, {
              disableClose: true,
              data: alertMessage,
              id: 'fail-alert',
            });
          }
        },
      );
    }
  }

  // Método para calcular costo final del equipo
  private ValidateFinalCostLoanEquipment(): void {
    const loanAmount = this.guarantee.loanAmount === 0 ? 1 : this.guarantee.loanAmount >= 3 ? 3 : this.guarantee.loanAmount;
    const percentage = this.parameters.WARRANTY_VALUES.CostPercentage[loanAmount];
    // this.guarantee.totalcostLoanEquipment = percentage * this.guarantee.costLoanEquipment;
    this.guarantee.totalcostLoanEquipment = this.guarantee.costLoanEquipment;

    this.guarantee.nextMethod = 'ShowModalEquipmentCost';
    this.crmUtilService.SaveStep(this.guarantee);
    this.ShowModalEquipmentCost();
  }

  // Método para mostrar base de conocimiento con cobro de equipo
  private ShowModalEquipmentCost(): void {
    // base de conocimiento, si viene Recibido en domicilio con entrega malas condiciones (ReturnEquipment) va por COBROEQUIPO
    // si viene de RPO va por CONDICIONESDEVOLUCION
    const nameKnowledgeOption = this.guarantee.odsMethod === 'ReturnEquipmentRule' ? 'COBROEQUIPO' : 'CONDICIONESDEVOLUCION';
    this.libknowledgeBase.searchByNameScript(nameKnowledgeOption);
    this.libknowledgeBase.openKnowledgeBaseModal({ btnCancel: false, titleScript: false }).then(respKn => {
      if (this.guarantee.nameCaseStateSelected !== ODSStates.ReceivedHome) {
        this.guarantee.nextMethod = 'ChargeToInvoiceRule';
        this.crmUtilService.SaveStep(this.guarantee);
        this.ChargeToInvoiceRule();
      } else {
        const dialogRef = this.dialog.open(CreateOCCComponent, {
          disableClose: true,
          data: this.guarantee,
        });
        dialogRef.afterClosed().subscribe(resp => {
          if (resp) {
            const dialogRef2 = this.dialog.open(InformativeModalComponent, {
              disableClose: true,
              data: this.parameters.WARRANTY_MESSAGES.OccCreated,
              id: 'success-alert',
            });
            dialogRef2.afterClosed().subscribe(resp => {
              if (resp) {
                this.guarantee.nextMethod = 'UpdateCaseManual';
                this.crmUtilService.SaveStep(this.guarantee);
                this.RedirectChangeOwnership();
              }
            });
          }
        });
      }
    });
  }

  // Método para validar cuanto tiempo lleva en punto de origen y si aplica cobro de almacenamiento
  private ValidateTimeAtPointOfOrigin(): void {
    this.guarantee.numberDays = this.guarantee.selectedCase.daysCurrentState;
    // this.guarantee.numberDays = 114;//QUEMADO
    if (this.guarantee.numberDays > this.parameters.WARRANTY_VALUES.MaximumDaysAtOriginPoint) {
      this.guarantee.nextMethod = 'ValidateStorageCost';
      this.crmUtilService.SaveStep(this.guarantee);
      this.ValidateStorageCost();
    } else {
      this.guarantee.nextMethod = 'ValidateEquipmentOnLoan';
      this.crmUtilService.SaveStep(this.guarantee);
      this.ValidateEquipmentOnLoan();
    }
  }
  // metodo para instanciar costo por almacenamiento
  private ConsultEquipmentCstPayment(): Promise<number> {
    return new Promise((resolve) => {
      //se pone 1 mientras liberan elservicio de los demas CST
      // this.imeiTools.GetDetailPayment(this.guarantee.odsOfCase.idOds, this.guarantee.selectedCase.tsc).subscribe(respPayment=>{
      this.imeiTools.GetDetailPayment(this.guarantee.odsOfCase.idOds, 1).subscribe(respPayment => {
        if (respPayment !== null) {
          if (respPayment.isValid && respPayment.data.length > 0) {
            //Aplica cobro de almacenamiento
            const storagePayment = respPayment.data.find(pay => pay.typeService === 1);
            storagePayment !== undefined ? resolve(storagePayment.value) : resolve(0);
          } else {
            //no aplica
            resolve(0);
          }
        } else this.util.OpenAlert(this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.ServiceNotAvailable, 'DetailPayments (Costo de bodegaje)'), false);
      }, (error) => {
        this.custom.SetMessageError = 'Error en servicio para consultar costo de bodegaje ';
      });
    });
  }

  private ValidateStorageCost(): void {
    let response: CatalogManagementResponse;
    const request: CatalogManagementRequest = {
      //Data quemada en parametro. Segun especificacion de documentacion y reuniones con dueños, son los parametros y el identificador del producto los que determinan su valores de cobro
      body: this.parameters.BODY_CATALOGMANAGEMENT,
      parameters: {
        id: 'PO_EquipoPosValDiaAlamacen',
        idBusinessTransaction: this.guarantee.idBizInteraction,
        idApplication: this.guarantee.idFlow,
        userApplication: this.guarantee.idUser,
        startDate: this.util.ActualDate(),
        additionalNode: 'addNotes',
        target: 'ECM',
        channel: 'USSD',
        fields: 'id,name,description,productOfferingPrices'
      }
    }
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateCatalogManagement - CatalogManagement', dataTraza: request });
    this.externaslService.PostCatalogManagement(request).subscribe(
      datos => response = datos,
      (error) => {
        this.util.OpenAlert('El servicio (WsCatalogManagement) esta respondiendo con el siguiente error: ' + error.name, false);
        this.custom.SetMessageError = 'Error al consultar servicio para conocer valor del equipo ';
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, error: true, descriptionTraza: 'ValidateCatalogManagement - CatalogManagement', valueTraza: response });
      },
      () => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateCatalogManagement - CatalogManagement', valueTraza: response });

        this.ConsultEquipmentCstPayment().then(value => {
          console.log('value costStorageEquipment', value);
          this.guarantee.costStorageEquipment = Number(value);// se dejara mientras se proveen los costos
          // this.guarantee.costStorageEquipment = Number(response.getProductOfferingResponse[0]?.versions[0]?.productOfferingPrices[1]?.versions[0]?.price?.amount) * this.guarantee.numberDays;
          this.ValidateCallPaymentStorage();
        });
      },
    );
  }
  private ValidateCallPaymentStorage(): void {
    if (this.guarantee.costStorageEquipment === 0) {
      this.guarantee.nextMethod = 'ValidateEquipmentOnLoan';
      this.crmUtilService.SaveStep(this.guarantee);
      this.ValidateEquipmentOnLoan();
    } else {
      this.guarantee.typePayment = TypePayment.StoragePayment;
      const dialogRef = this.dialog.open(InformativeModalComponent, {
        disableClose: true,
        data: this.parameters.WARRANTY_MESSAGES.RequestInvoiceStorage,
        id: 'success-alert',
      });
      dialogRef.afterClosed().subscribe(respInfo => {
        if (respInfo) {
          const currency = this.util.GetCurrency(this.guarantee.costStorageEquipment);
          if (this.guarantee.codeCav === undefined || this.guarantee.codeCav === null) this.guarantee.codeCav = '0';
          this.externaslService.getSuccessFactorInfo(this.guarantee).then(res => {
            if (res) {
              this.guarantee.successFactorInfo = res;
              if (res.salePoint !== undefined && res.salePoint !== '' && res.salePoint !== null) {
                this.ValidateCallPaymentSGetCAV();
              } else {
                this.CallComponentCash();
              }
            }
          })
        }
      });//
    }
  }

  private ValidateCallPaymentSGetCAV(): void {
    this.externaslService.GetCavByName(this.guarantee.successFactorInfo.salePoint).subscribe((respCav: CavServiceResponse) => {
      this.custom.DelCountError();
      this.guarantee.cavInfo = (respCav.response.isValid) ? respCav.cavs[0] : undefined
      if (this.guarantee.cavInfo) sessionStorage.setItem('codeCav', this.guarantee.cavInfo.codeCav.toString())
      this.CallComponentCash();
    }, error => {
      this.custom.AddCountError();
      if (this.custom.GetCountError() <= environment.ic) {
        this.ValidateCallPaymentSGetCAV(); //Vuelve a consumir el ws para que haya respuesta
      } else {
        this.custom.DelCountError();
      }
    });
  }

  // Método para mostrar regla para preguntar si cliente realizó pago de cobro de almacenamiento
  private ValidatePaymentStorageRule(): void {
    sessionStorage.removeItem('paymentVerified');
    if (this.guarantee.storagePaymentDone) {
      let cstVerifyPaymentRq = new CstVerifyPaymentRequest();
      cstVerifyPaymentRq.headerRequest = HEADER_REQUEST;
      cstVerifyPaymentRq.codeODS = this.guarantee.odsOfCase.idOds;
      cstVerifyPaymentRq.invoiceNumber = String(this.guarantee.cashPaymentValidation.cashInvoice.reference);
      this.imeiTools.NotifyPaymentCST(cstVerifyPaymentRq, this.guarantee.selectedCase.tsc).subscribe(resp => {
        if (resp.isValid) {
          this.guarantee.nextMethod = 'ValidateEquipmentOnLoan';
          this.crmUtilService.SaveStep(this.guarantee);
          this.ValidateEquipmentOnLoan();
        } else {
          // const dialogInfo = this.dialog.open(InformativeModalComponent, {
          //   disableClose: true,
          //   data: 'No se actualizó pago de cobro por bodegaje en CST.' + resp.message,
          //   id: 'fail-alert',
          // });
          // dialogInfo.afterClosed().subscribe(r=>{
          //   this.ValidatePaymentStorageRule();
          // });
          this.guarantee.nextMethod = 'ValidateEquipmentOnLoan';
          this.crmUtilService.SaveStep(this.guarantee);
          this.ValidateEquipmentOnLoan();
        }
      });
    } else {
      this.guarantee.nextMethod = 'UpdateCasePaymentNotMade';
      this.crmUtilService.SaveStep(this.guarantee);
      this.UpdateCasePaymentNotMade();
    }
  };

  //Metodo para desplegar modal de actualzación de caso a pago no realizado por el cliente
  private UpdateCasePaymentNotMade(): void {
    this.ConsultCaseAsync().then(() => {
      this.guarantee.selectedCase.paymentNotMade = "STORAGE"
      const dialogDetail = this.dialog.open(InternalCaseDetailComponent, {
        disableClose: true,
        data:
        {
          selectedCase: this.guarantee.selectedCase,
          odsOfCase: this.guarantee.odsOfCase,
          listCaseStates: this.listCaseStates,
          isCloseCase: true, //pendiente validar,
          paymentCheck: true, //Visualizar la opción (Pago realizado por el cliente) en el modal ODS
          positiveBalance: this.guarantee.positiveBalance
        }
      });
      dialogDetail.afterClosed().subscribe(resp => {
        if (resp || resp?.resp) {
          if (resp?.ods) {
            this.guarantee.odsResponses.find(x => x.idOds === resp.ods?.idOds).state = resp.ods?.state;
          }
          this.listODS = new MatTableDataSource(this.guarantee.odsResponses);
          this.libknowledgeBase.searchByNameScript('OBSERVACIONNOPAGO');
          this.libknowledgeBase.openKnowledgeBaseModal({ btnCancel: false, titleScript: false }).then(respKn => {
            if (respKn) {
              this.guarantee.nextMethod = 'CloseCase';
              this.crmUtilService.SaveStep(this.guarantee);
              this.sendMessage('ForgottenPayment');
              this.CloseCase();
            }
          });
        }
      });
    });
  }

  // Método para validar si hay equipo en prestamo
  private ValidateEquipmentOnLoan(): void {
    this.guarantee.hasEquipmentOnLoan = this.guarantee.odsOfCase.equipLoanI || false;
    //  this.guarantee.hasEquipmentOnLoan = true;// QUEMADO
    if (this.guarantee.hasEquipmentOnLoan) {
      const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.EquipmentOnLoan)
      dialogRef.afterClosed().subscribe(resp => {
        if (resp) {
          this.guarantee.nextMethod = 'HasEquipmentRule';
          this.crmUtilService.SaveStep(this.guarantee);
          this.HasEquipmentRule();
        }
      });
    } else {
      const dialogRef2 = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.EquipmentNoLoan)
      dialogRef2.afterClosed().subscribe(respInfo => {
        if (respInfo) {
          if (this.guarantee.nameCaseStateSelected !== ODSStates.ReceivedOriginPoint) {
            this.guarantee.nextMethod = 'ValidateDeliveryTimes';
            this.crmUtilService.SaveStep(this.guarantee);
            this.ValidateDeliveryTimes()
          } else {
            this.guarantee.nextMethod = 'CosmeticNoveltiesRule';
            this.crmUtilService.SaveStep(this.guarantee);
            this.CosmeticNoveltiesRule();
          }
        }
      });
    }
  }

  // Método para mostrar regla para preguntar si cliente tiene equipo
  private HasEquipmentRule(): void {
    if (this.guarantee.odsOfCase.equipmentOnLoan !== undefined && this.guarantee.odsOfCase.equipmentOnLoan !== null) {
      let valueImeiSerial = this.guarantee.odsOfCase.equipmentOnLoan?.imei !== '' ? this.guarantee.odsOfCase.equipmentOnLoan.imei : this.guarantee.odsOfCase.equipment.imei;
      this.custom.setImei = valueImeiSerial;
      const dialogRef = this.dialog.open(DecisionTableModalComponent, {
        disableClose: true,
        data: 'TieneEquipo'
      });
      dialogRef.afterClosed().subscribe(resp => {
        if (resp) {
          if (resp.value === 'SI') {
            this.guarantee.hasToPay = false
            this.guarantee.nextMethod = 'ValidateExistenceOfPhysicalCST';
            this.crmUtilService.SaveStep(this.guarantee);
            this.ValidateExistenceOfPhysicalCST();
          } else {
            this.guarantee.hasToPay = true
            if (resp.ruleName === 'TieneEquipo') {
              this.guarantee.nextMethod = 'ValidateLoanedEquipmentTimes';
              this.crmUtilService.SaveStep(this.guarantee);
              this.ValidateLoanedEquipmentTimes();
            } else { // Imei no corresponde a equipo
              this.guarantee.odsMethod = 'EquipmentWithIMEIRule';
              this.guarantee.nextMethod = 'ValidateLoanedEquipmentTimes';
              this.crmUtilService.SaveStep(this.guarantee);
              // se va a validar cobro por el equipo mostrara base de conocimiento
              this.ValidateLoanedEquipmentTimes();
            }
          }
        }
      });
    } else {
      this.util.OpenAlert('La ods no tiene información del equipo en préstamo asociado, verifique la información', false);
    }
  }

  // Método para mostrar regla para preguntar si cliente desea cargo a la factura
  private ChargeToInvoiceRule(): void {
    const dialogRef = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'DeseaCargo',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (resp.value === 'SI') {
          // creacion de factura modal
          // Solicita OCC
          if (this.parameters.WARRANTY_VALUES.ValidStatesOCC.includes(this.guarantee.nameCaseStateSelected)) {
            const dialogRef = this.dialog.open(CreateOCCComponent, {
              disableClose: true,
              data: this.guarantee,
            });
            dialogRef.afterClosed().subscribe(resp => {
              if (resp) {
                const dialogRef2 = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.OccCreated)
                dialogRef2.afterClosed().subscribe(resp => {
                  if (this.parameters.WARRANTY_VALUES.ValidStatesDeliveryTime.includes(this.guarantee.nameCaseStateSelected)) {
                    this.guarantee.nextMethod = 'ValidateDeliveryTimes';
                  } else {
                    this.guarantee.nextMethod = 'CosmeticNoveltiesRule'
                  }
                  this.crmUtilService.SaveStep(this.guarantee);
                  this.RedirectChangeOwnership();
                });
              }
            });

            //terminare aca
          } else {
            this.guarantee.nextMethod = 'ValidateDeliveryTimes';
            this.crmUtilService.SaveStep(this.guarantee);
            this.ValidateDeliveryTimes()
          }

        } else {
          this.guarantee.odsMethod = 'NotChargeToInvoice';
          this.guarantee.typePayment = TypePayment.LoanPayment;
          this.crmUtilService.SaveStep(this.guarantee);
          this.GenerateCashInvoice();
        }
      }
    });
  }
  private RedirectChangeOwnership(movilProductMsg?: boolean): void {
    if (movilProductMsg === true) {
      const message =
        "idUser:" + this.guarantee.idUser +
        ",min:" + this.guarantee.min +
        ",channelTypeCode:" + this.guarantee.tchannel +
        ",documentType:" + this.guarantee.documentType +
        ",documentNumber:" + this.guarantee.documentNumber +
        ",name:" + this.guarantee.name +
        ",lastName:" + this.guarantee.surname +
        ",MailForResponse:" + this.guarantee.email +
        ",imei:" + this.guarantee.odsOfCase.imei +
        ",imeiOriginal:" + this.guarantee.odsOfCase.imei +
        ",source:" + this.guarantee.source +
        ",idHeader:" + this.guarantee.biHeaderId +
        ",idTurn:" + this.guarantee.idTurn +
        ",account:" + this.guarantee.account +
        ",AddressId:" + this.guarantee.idAddress +
        ",originSourceG:" + encodeURIComponent(window.location.href.replace(window.location.hash, '')) +
        ",urlReturn:" + encodeURIComponent(window.location.href.replace(window.location.hash, ''));
      this._router.navigate(['/externalRedirectFlow/', message, this.parameters.URLSERVICIOSG.ChangeOwnership]);
      // this._router.navigate(['/externalRedirectFlow/', message, 'http://localhost:4200/#/cambiotitularidad/validacion']);
    } else {
      const dialogInfo = this.dialog.open(InformativeModalComponent, {
        disableClose: true,
        data: this.parameters.WARRANTY_MESSAGES.RedirectOwnershipSite,
        id: 'success-alert',
      });
      dialogInfo.afterClosed().subscribe(resp => {
        if (resp) {
          const message =
            "idUser:" + this.guarantee.idUser +
            ",min:" + this.guarantee.min +
            ",channelTypeCode:" + this.guarantee.tchannel +
            ",documentType:" + this.guarantee.documentType +
            ",documentNumber:" + this.guarantee.documentNumber +
            ",name:" + this.guarantee.name +
            ",lastName:" + this.guarantee.surname +
            ",MailForResponse:" + this.guarantee.email +
            ",imei:" + this.guarantee.odsOfCase.imei +
            ",imeiOriginal:" + this.guarantee.odsOfCase.imei +
            ",source:" + this.guarantee.source +
            ",idHeader:" + this.guarantee.biHeaderId +
            ",idTurn:" + this.guarantee.idTurn +
            ",account:" + this.guarantee.account +
            ",AddressId:" + this.guarantee.idAddress +
            ",originSourceG:" + encodeURIComponent(window.location.href.replace(window.location.hash, '')) +
            ",urlReturn:" + encodeURIComponent(window.location.href.replace(window.location.hash, ''));
          this._router.navigate(['/externalRedirectFlow/', message, this.parameters.URLSERVICIOSG.ChangeOwnership]);
          // this._router.navigate(['/externalRedirectFlow/', message, 'http://localhost:4200/#/cambiotitularidad/validacion']);
        }
      });
    }
  }

  private GenerateCashInvoice(): void {
    // metodo para llamar micrositio de Componente de pagos
    this.externaslService.getSuccessFactorInfo(this.guarantee).then(res => {
      if (res) {
        if (!this.guarantee.cavInfo) {
          // this.guarantee.successFactorInfo.salePoint = '300'// Quemado para cuando no se necesite cav
          this.externaslService.GetCavByName(this.guarantee.successFactorInfo.salePoint).subscribe((respCav: CavServiceResponse) => {
            this.custom.DelCountError();
            this.guarantee.cavInfo = (respCav.response.isValid) ? respCav.cavs[0] : undefined
            this.CallComponentCash()
          }, error => {
            this.custom.AddCountError();
            if (this.custom.GetCountError() <= environment.ic) {
              this.GenerateCashInvoice(); //Vuelve a consumir el ws para que haya respuesta
            } else {
              this.custom.DelCountError();
            }
          });
        } else {
          this.CallComponentCash()
        }
      }
    })
  }

  private CallComponentCash() {
    if (this.guarantee.strXmlPaymentService === undefined) this.guarantee.strXmlPaymentService = this.parameters.URLSERVICIOSG.WsPaymentServiceOrder.Xml;
    this.reqParameter = new RequestParameter();
    this.reqParameter.name = 'INCREMENTALINVOICE';
    this.crmUtilService.PostParameter(this.reqParameter).subscribe(resp => {
      let parameterUpdate: ResponseParameter = resp;
      let jsonValue = JSON.parse(parameterUpdate.VALUE_PARAMETER);
      let valueConsecutiveUp = Number(jsonValue.valueInc);
      valueConsecutiveUp = valueConsecutiveUp + 1;
      jsonValue.valueInc = valueConsecutiveUp;
      parameterUpdate.VALUE_PARAMETER = JSON.stringify(jsonValue);
      this.crmUtilService.UpdateParameter(parameterUpdate);      //
      let cashInvoice: CashPayInvoice = undefined;
      cashInvoice = {
        reference: valueConsecutiveUp,
        documentType: this.guarantee.documentTypeCode,
        shortDocType: this.guarantee.documentType,
        documentNumber: this.guarantee.documentNumber,
        name: this.guarantee.name,
        surname: this.guarantee.surname,
        account: this.guarantee.account,
        email: this.guarantee.selectedCase.client.email,
        concept: this.guarantee.typePayment === TypePayment.LoanPayment ? 'Valor de equipo en préstamo' : 'Costo de bodegaje', // valor por defecto parcial
        userId: this.guarantee.idUser,
        orderType: 'Equipo', // valor por defecto,
        productId: this.guarantee.typePayment === TypePayment.LoanPayment ? 'PO_Equ' + this.guarantee.productOfferingId : 'PO_EquipoPosValDiaAlamacen',
        productName: this.guarantee.typePayment === TypePayment.LoanPayment ? 'PO_Equ' + this.guarantee.productOfferingId : 'PO_EquipoPosValDiaAlamacen',
        nameCav: (this.guarantee.cavInfo && this.guarantee.cavInfo.nameCav) ? this.guarantee.cavInfo.nameCav : '',
        cityCav: (this.guarantee.cavInfo && this.guarantee.cavInfo.city) ? this.guarantee.cavInfo.city : '',
        // paymentValue: this.guarantee.typePayment === TypePayment.LoanPayment ? this.guarantee.totalcostLoanEquipment : this.guarantee.costStorageEquipment
        paymentValue: this.guarantee.costStorageEquipment
      }
      console.log('cashInvoice items', cashInvoice);
      let cashValidation: CashPaymentValidation = undefined;
      cashValidation = {
        generatePayment: true,
        cashInvoice: cashInvoice
      }
      this.guarantee.cashPaymentValidation = undefined;
      this.guarantee.cashPaymentValidation = cashValidation;
      if (!this.dialog.getDialogById('errorModal')) { //Si no hay abierto modal de error
        const dialogRef = this.dialog.open(CashpaymentinvoiceComponent, {
          disableClose: true,
          data: {
            cashValidation: cashValidation,
            documentTypes: this.documentTypes,
            guarantee: this.guarantee
          }
        });
        dialogRef.afterClosed().subscribe(resp => {
          if (resp) {
            if (resp.isValid) {
              this.guarantee.odsMethod = 'GenerateCashInvoice'
              this.guarantee.nextMethod = 'OpenComponentCash';
              this.guarantee.urlPayCash = resp.message;
              this.guarantee.urlComponent = this.guarantee.urlPayCash;
              if (this.guarantee.typePayment === TypePayment.LoanPayment) this.crmUtilService.SaveStep(this.guarantee);
              this.OpenComponentCash();
            } else {
              this.util.OpenAlert('No se pudo obtener url de micrositio de pagos', false);
            }
          }
        });
      }

      //
    }, (error) => {
      this.util.OpenAlert('El servicio (RequestParameter) esta respondiendo con el siguiente error: ' + error.name, false);
      this.custom.SetMessageError = 'No se actualizado el valor incremental de factura ';
    });
  }

  private OpenComponentCash(): void {
    const externalDialog = this.dialog.open(ModalMicrositesComponent, {
      width: '100%', height: '90%',
      disableClose: true,
      data: { urlSite: this.guarantee.urlComponent, anexo: false }
    });
    externalDialog.afterClosed().subscribe(resp => {
      if (resp) {
        if (this.guarantee.odsMethod === 'GenerateCashInvoice') {
          this.guarantee.typePayment === TypePayment.LoanPayment ? this.libknowledgeBase.searchByNameScript('PAGOFACTURAGENERADA') : this.libknowledgeBase.searchByNameScript('PAGOENCAJA');
          this.libknowledgeBase.openKnowledgeBaseModal({ btnCancel: false, titleScript: false }).then(respBase => {
            this.VerifyPaymentCash();
          });
        }
      }
    });
  }
  private VerifyPaymentCash(): void {
    this.externaslService.getSuccessFactorInfo(this.guarantee).then(res => {
      if (res) {
        if (this.guarantee.cashPaymentValidation.cashInvoice.nameCav === "") {
          this.externaslService.GetCavByName(this.guarantee.successFactorInfo.salePoint).subscribe((respCav: CavServiceResponse) => {
            this.custom.DelCountError();
            this.guarantee.cavInfo = (respCav.response.isValid) ? respCav.cavs[0] : undefined
            this.guarantee.cashPaymentValidation.cashInvoice.cityCav = this.guarantee.cavInfo.city
            this.guarantee.cashPaymentValidation.cashInvoice.nameCav = this.guarantee.cavInfo.nameCav
            this.CallCashPaymentInvoiceComponent()
          }, error => {
            this.custom.AddCountError();
            if (this.custom.GetCountError() <= environment.ic) {
              this.VerifyPaymentCash(); //Vuelve a consumir el ws para que haya respuesta
            } else {
              this.custom.DelCountError();
            }
          })
        } else {
          this.CallCashPaymentInvoiceComponent()
        }
      }
    })
  }

  private CallCashPaymentInvoiceComponent() {
    this.guarantee.cashPaymentValidation.generatePayment = false;// se le envia false porque ya genero la factura ahora va a verificar
    if (!this.dialog.getDialogById('errorModal')) { //Si no hay abierto modal de error
      const dialogRef = this.dialog.open(CashpaymentinvoiceComponent, {
        disableClose: true,
        data: {
          cashValidation: this.guarantee.cashPaymentValidation,
          documentTypes: this.documentTypes,
          guarantee: this.guarantee
        }
      });
      dialogRef.afterClosed().subscribe(resp => {
        if (resp) {
          if (resp.isValid && resp.message === this.parameters.STATESVERIFYCASH.EndPay) {
            if (this.guarantee.typePayment === TypePayment.StoragePayment) this.guarantee.storagePaymentDone = true;
            const dialogInfo = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.PaymentDone)
            dialogInfo.afterClosed().subscribe(resp => {
              if (resp) {
                this.guarantee.odsMethod = 'VerifyPaymentCash';
                if (this.guarantee.typePayment === TypePayment.LoanPayment) this.guarantee.LoanPaymentDone = true;
                this.guarantee.typePayment === TypePayment.LoanPayment ? this.guarantee.nextMethod = 'ValidatePaymentCashRule' : this.guarantee.nextMethod = 'ValidatePaymentStorageRule';
                if (this.guarantee.typePayment === TypePayment.LoanPayment) this.crmUtilService.SaveStep(this.guarantee);
                this.guarantee.typePayment === TypePayment.LoanPayment ? this.RedirectChangeOwnership() : this.ValidatePaymentStorageRule();
              }
            });
          } else {
            const callValidatePaymentCashRule = (paymentMade: boolean) => {
              this.guarantee.paymentMade = paymentMade;
              if (this.guarantee.typePayment === TypePayment.StoragePayment) this.guarantee.storagePaymentDone = false;
              this.guarantee.odsMethod = 'VerifyPaymentCash';
              this.guarantee.typePayment === TypePayment.LoanPayment ? this.guarantee.nextMethod = 'ValidatePaymentCashRule' : this.guarantee.nextMethod = 'ValidatePaymentStorageRule';
              if (this.guarantee.typePayment === TypePayment.LoanPayment) this.crmUtilService.SaveStep(this.guarantee);
              this.guarantee.typePayment === TypePayment.LoanPayment ? this.ValidatePaymentCashRule() : this.ValidatePaymentStorageRule();

            }

            const verify = sessionStorage.getItem('paymentVerified')
            let alertMessage: string
            if (!verify) alertMessage = this.parameters.WARRANTY_MESSAGES.CashPaymentNotVerify;
            else if (verify === 'true') alertMessage = this.parameters.WARRANTY_MESSAGES.CashPaymentToInvoice;
            else return callValidatePaymentCashRule(false);

            const dialogInfo = this.dialog.open(InformativeModalComponent, {
              disableClose: true,
              data: alertMessage,
              id: 'fail-alert',
            });
            dialogInfo.afterClosed().subscribe(resp => {
              if (resp) {
                callValidatePaymentCashRule(verify === 'true')
              }
            });
          }
        }
      });
    }
  }

  private ValidatePaymentCashRule(): void {
    // se pone este booleano para cuando el metodo no sea llamado por metodo sino por recuperacion de pasos
    if (this.guarantee.LoanPaymentDone !== undefined) this.guarantee.paymentMade = this.guarantee.LoanPaymentDone;
    if (this.guarantee.paymentMade) {
      this.guarantee.nameCaseStateSelected === ODSStates.ReceivedOriginPoint ? this.guarantee.nextMethod = 'CosmeticNoveltiesRule' : this.guarantee.nextMethod = 'ValidateDeliveryTimes';
      this.crmUtilService.SaveStep(this.guarantee);
      this.guarantee.nameCaseStateSelected === ODSStates.ReceivedOriginPoint ? this.CosmeticNoveltiesRule() : this.ValidateDeliveryTimes();
    } else {
      this.guarantee.isCloseCasePayment = true;
      this.guarantee.updateODSPayment = false;
      this.guarantee.nextMethod = 'CasePaymentNotMade';
      this.crmUtilService.SaveStep(this.guarantee);
      this.CasePaymentNotMade()
    }
  };

  private CasePaymentNotMade(): void {
    if (this.guarantee.isCloseCasePayment === undefined) this.guarantee.isCloseCasePayment = true;
    if (this.guarantee.updateODSPayment === undefined) this.guarantee.updateODSPayment = true
    this.guarantee.odsOfCase.updateODS = this.guarantee.updateODSPayment;
    this.guarantee.selectedCase.paymentNotMade = "EQUIPMENT";
    const dialogDetail = this.dialog.open(InternalCaseDetailComponent, {
      disableClose: true,
      data:
      {
        selectedCase: this.guarantee.selectedCase,
        odsOfCase: this.guarantee.odsOfCase,
        listCaseStates: this.listCaseStates,
        isCloseCase: this.guarantee.isCloseCasePayment,
        positiveBalance: this.guarantee.positiveBalance
      }
    });
    dialogDetail.afterClosed().subscribe(resp => {
      if (resp) {
        this.guarantee.isCloseCasePayment = undefined; //Se inicializa
        this.guarantee.updateODSPayment = undefined; //Se inicializa
        if (resp == true) {
          resp = { resp: true, ods: this.guarantee.odsOfCase };
        }
        this.guarantee.odsResponses.find(x => x.idOds === resp.ods?.idOds).state = resp.ods?.state;
        this.listODS = new MatTableDataSource(this.guarantee.odsResponses);
        const dialogRef = this.dialog.open(CreateOCCComponent, {
          disableClose: true,
          data: this.guarantee,
        });
        dialogRef.afterClosed().subscribe(resp => {
          if (resp) {
            const dialogRef2 = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.OccCreated);
            dialogRef2.afterClosed().subscribe(resp => {
              if (resp) {
                this.guarantee.nextMethod = this.guarantee.nameCaseStateSelected === ODSStates.ReceivedOriginPoint ? 'CosmeticNoveltiesRule' : 'ValidateDeliveryTimes';
                this.guarantee.odsMethod = 'CasePaymentNotMade'
                this.crmUtilService.SaveStep(this.guarantee);
                this.RedirectChangeOwnership();
              }
            });
          }
        });
      }
    });

  }

  // Método para consumir ws para validar si hay cst fisico
  private ValidateExistenceOfPhysicalCST(): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateExistenceOfPhysicalCST - GetCaV', dataTraza: this.guarantee.codeCav });
    this.externaslService.getSuccessFactorInfo(this.guarantee).then(res => {
      if (res) {
        this.guarantee.successFactorInfo = res;
        if (res.salePoint !== undefined && res.salePoint !== '' && res.salePoint !== null) {
          // this.guarantee.successFactorInfo.salePoint = '300'// Quemado para cuando no se necesite cav
          this.externaslService.GetCavByName(this.guarantee.successFactorInfo.salePoint).subscribe(responseCav => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateExistenceOfPhysicalCST - GetCaV', valueTraza: responseCav });
            if (responseCav.response.isValid && responseCav.cavs && responseCav.cavs.length > 0 && responseCav.cavs[0].model === ModalityCav.Presencial) {
              this.custom.DelCountError();
              this.guarantee.cavInfo = (responseCav.response.isValid) ? responseCav.cavs[0] : undefined
              sessionStorage.setItem('codeCav', this.guarantee.cavInfo.codeCav.toString())
              const dialogRef = this.dialog.open(InformativeModalComponent, {
                disableClose: true,
                data: this.parameters.WARRANTY_MESSAGES.DeliverEquipmentCST,
                id: 'success-alert',
              });
              dialogRef.afterClosed().subscribe(resp => {
                if (resp) {
                  this.guarantee.nextMethod = 'ApprovedRevisionRule';
                  this.crmUtilService.SaveStep(this.guarantee);
                  this.ApprovedRevisionRule();
                }
              });
            } else {
              this.NotExistenceOfCST();
            }
          }, error => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateExistenceOfPhysicalCST - GetCaV', error: true, valueTraza: error });
            this.custom.AddCountError();
            if (this.custom.GetCountError() <= environment.ic) {
              this.ValidateExistenceOfPhysicalCST(); //Vuelve a consumir el ws para que haya respuesta
            } else {
              this.custom.DelCountError();
            }
          });
        } else this.NotExistenceOfCST();
      }
    })
  }
  private NotExistenceOfCST(): void {
    const dialogRef = this.dialog.open(InformativeModalComponent, {
      disableClose: true,
      data: this.parameters.WARRANTY_MESSAGES.DeliverEquipmentStoreman,
      id: 'success-alert',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (this.guarantee.nameCaseStateSelected !== ODSStates.ReceivedOriginPoint) {
          this.guarantee.nextMethod = 'ValidateDeliveryTimes';
          this.crmUtilService.SaveStep(this.guarantee);
          this.ValidateDeliveryTimes()
        } else {
          this.guarantee.nextMethod = 'CosmeticNoveltiesRule';
          this.crmUtilService.SaveStep(this.guarantee);
          this.CosmeticNoveltiesRule();
        }
      }
    });
  }


  // Método para mostrar regla para preguntar si la revisión fue aprobada
  private ApprovedRevisionRule(): void {
    const dialogRef = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'RevisionAprobada',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (resp.value === 'SI') {
          this.guarantee.nextMethod = 'DisassociateEquipmentOnLoan';
          this.crmUtilService.SaveStep(this.guarantee);
          this.DisassociateEquipmentOnLoan();
          this.guarantee.hasToPay = false
        } else {
          this.ValidateLoanedEquipmentTimes()
          this.guarantee.hasToPay = true
        }
      }
    });
  }

  //Método para desasociar equipo en prestamo
  private DisassociateEquipmentOnLoan(): void {
    //Desasociar equipo en prestamo. Pendiente.
    const statesToValidate = [ODSStates.ReceivedOriginPoint, ODSStates.RefundMoney]
    const exists = statesToValidate.find(x => x === this.guarantee.nameCaseStateSelected)
    if (!exists) {
      this.guarantee.nextMethod = 'ValidateDeliveryTimes';
      this.crmUtilService.SaveStep(this.guarantee);
      this.ValidateDeliveryTimes()
    } else {
      const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.DeliverEquipmentStoreman)
      dialogRef.afterClosed().subscribe(resp => {
        if (resp) {
          if (this.guarantee.nameCaseStateSelected === ODSStates.RefundMoney) {
            this.guarantee.nextMethod = 'ValidateDeliveryTimes';
            this.crmUtilService.SaveStep(this.guarantee);
            this.ValidateDeliveryTimes()
          } else {
            this.guarantee.nextMethod = 'CosmeticNoveltiesRule';
            this.crmUtilService.SaveStep(this.guarantee);
            this.CosmeticNoveltiesRule();
          }
        }
      })
    }
  }

  private ValidateDeliveryTimes(): void {
    let totalDaysNoFullFilled: number;
    //1. Obtiene info de CAV
    if (this.guarantee.cavInfo === undefined) {
      this.externaslService.getSuccessFactorInfo(this.guarantee).then(res => {
        if (res) {
          this.guarantee.successFactorInfo = res;
          if (res.salePoint !== undefined && res.salePoint !== '' && res.salePoint !== null) {
            this.externaslService.GetCavByName(this.guarantee.successFactorInfo.salePoint).subscribe((respCav: CavServiceResponse) => {
              this.custom.DelCountError();
              if (respCav.response.isValid) {
                this.guarantee.cavInfo = respCav.cavs[0];
                sessionStorage.setItem('codeCav', this.guarantee.cavInfo.codeCav.toString());
                this.ValidateDeliveryTimes();
              } else {
                this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.NotCavsAssociated, false);
              }
            }, error => {
              this.custom.AddCountError();
              if (this.custom.GetCountError() <= environment.ic) {
                this.ValidateDeliveryTimes(); //Vuelve a consumir el ws para que haya respuesta
              } else {
                this.custom.DelCountError();
              }
            });
          } else this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.NotCavsAssociated, false);
        }
      });
      // 2. Validar si CST cumplió tiempos de entrega
    } else {
      // cstFulfilled indica si el CST cumplio o no tiempos de entrega
      this.guarantee.numberDays = this.guarantee.selectedCase.daysCurrentState || 0;
      this.deliveryTimes.CountDaysByDates(this.guarantee.cavInfo.serviceTime, this.guarantee.numberDays)
        .subscribe(responseOK => {
          if (responseOK) {
            // this.guarantee.numberDays = 90 // QUEMADO
            // this.guarantee.cavInfo.serviceTime = 120 //QUEMADO
            totalDaysNoFullFilled = this.warrantyService.getBreachTimeDays;
            this.guarantee.cstFulfilled = totalDaysNoFullFilled <= 0;
            // si es dev dinero , recibido en punto de origen, en domicilio, cambio equipo , muestra modal de cumplimiento
            const statesToValidate = [
              ODSStates.ReceivedHome, ODSStates.ReceivedOriginPoint,
              ODSStates.EquipmentChange, ODSStates.RefundMoney,
              ODSStates.Closed
            ]
            const exists = statesToValidate.find(x => x === this.guarantee.nameCaseStateSelected)
            // 3. CST cumplió
            if (this.guarantee.cstFulfilled) {
              if (!exists) {
                const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ProductNotAvailable)
                dialogRef.afterClosed().subscribe(res => {
                  if (res) {
                    this.guarantee.nextMethod = 'CloseCase';
                    this.crmUtilService.SaveStep(this.guarantee);
                    this.sendMessage('DiagnosisNotOver');
                    this.CloseCase();
                  }
                })
              } else {
                const dialogInfo = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.cstFullFilledTimes)
                dialogInfo.afterClosed().subscribe(dgl => {
                  if (dgl) {
                    if (this.guarantee.nameCaseStateSelected === ODSStates.RefundMoney) {
                      this.guarantee.nextMethod = 'ValidateFinancing';
                      this.crmUtilService.SaveStep(this.guarantee);
                      this.ValidateFinancing();
                    } else if (this.guarantee.nameCaseStateSelected === ODSStates.EquipmentChange) {
                      this.guarantee.nextMethod = 'ValidateInventory';
                      this.crmUtilService.SaveStep(this.guarantee);
                      this.ValidateInventory();
                    } else {
                      this.guarantee.odsMethod = 'ValidateDeliveryTimes';
                      this.guarantee.nextMethod = 'UpdateCaseManual';
                      this.guarantee.isCloseCase = true;
                      this.crmUtilService.SaveStep(this.guarantee);
                      this.UpdateCaseManual();
                    }
                  }
                });
              }
              //4. CST incumplió
            } else {
              // Registrar entrega de equipo. Pendiente
              const statesToValidate = this.parameters.WARRANTY_VALUES.ValidStatesDeliveryTime;
              const alsoExists = statesToValidate.find(x => x === this.guarantee.nameCaseStateSelected);
              if (!exists || alsoExists) {
                const message = this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.cstNoFullFilledTimes, totalDaysNoFullFilled.toString())
                const dialogRef = this.util.getMessageModal(message)
                dialogRef?.afterClosed().subscribe(res => {
                  if (res) {
                    this.guarantee.caseMemorandumMethod = 'ValidateInventory';
                    this.guarantee.nextMethod = 'UpdateCaseMemorandum';
                    this.guarantee.odsMethod = 'ValidateDeliveryTimes'
                    this.crmUtilService.SaveStep(this.guarantee);
                    this.UpdateCaseMemorandum()
                  }
                })
              } else {
                console.log('ESTADO NO VALIDO')
              }
            }
          } else {
            if (this.custom.GetCountError() <= environment.ic) {
              this.ValidateDeliveryTimes();
            } else {
              this.custom.DelCountError();
            }
          }
        }
        );
    }
  }

  //Método para validar disponibilidad de inventario
  private ValidateInventory(): void {
    // Simulación #Existencia inventario. Pendiente servicio para consulta inventario.
    const data = sessionStorage.getItem('existInventory');
    this.guarantee.existInventory = data !== undefined && data !== null ? true : false;
    const device: Device = { //Data simulada, pendiente mapear valores
      brand: 'Brand',
      disableInventory: false,
      model: 'AA',
      reference: 'BB',
      reserve: true,
      serial: 'A001',
      state: 'CC'
    }

    // Fin Simulación #Existencia inventario
    const dialogEquipmentAvailable = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'ExisteDisponibilidad',
    });
    dialogEquipmentAvailable.afterClosed().subscribe(res => {
      if (res) {
        if (res.value === 'NO') {
          // this.guarantee.existInventory = false//Quemado
          // this.ValidateSellWithAccesories();
          // this.guarantee.nextMethod = 'ValidateSellWithAccesories';
          this.ConsultCaseAsync().then(() => {
            if (this.guarantee.enterWithAccessories) {
              const enteredWithAccesoriesMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ClientWithAccesories);
              enteredWithAccesoriesMsg.afterClosed().subscribe(resp => {
                if (resp) {
                  this.guarantee.nextMethod = 'ValidateReturnOfAccesories';
                  this.crmUtilService.SaveStep(this.guarantee);
                  this.ValidateReturnOfAccesories();
                }
              });
            } else {
              const deliverToCustomerMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ClientWithNoAccesories);
              deliverToCustomerMsg.afterClosed().subscribe(resp => {
                if (resp) {
                  this.AfterValidateFinancing();
                }
              });
            }
          })
        } else {
          sessionStorage.setItem("existeDisponibilidad", 'true');
          if (this.guarantee.existInventory) {
            const dialogDetail = this.dialog.open(DeviceDetailComponent, {
              disableClose: true,
              data: device,
              id: 'success-alert',
            });
            dialogDetail.afterClosed().subscribe(resp => {
              if (resp) {
                if (resp == 'Reserva') {
                  const dialogRef = this.dialog.open(InformativeModalComponent, {
                    disableClose: true,
                    data: 'Equipo Reservado',
                    id: 'success-alert',
                  });
                  dialogRef.afterClosed().subscribe(resp => {
                    if (resp) {
                      this.guarantee.nextMethod = 'CosmeticNoveltiesRule';
                      this.crmUtilService.SaveStep(this.guarantee);
                      this.CosmeticNoveltiesRule();
                    }
                  });
                }
              }
            });
          }
          const negotiateProposalMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.NegotiateProposal);
          negotiateProposalMsg.afterClosed().subscribe(() => {
            const dialogDeliveryMethod = this.dialog.open(DecisionTableModalComponent, {
              disableClose: true,
              data: 'ClienteAceptaMetodo',
            });
            dialogDeliveryMethod.afterClosed().subscribe(res => {
              if (res) {
                if (res.value.toUpperCase() === 'NO') {
                  this.ValidateSellWithAccesories();
                } else {
                  const reserveEquipmentMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ReserveEquipment);
                  reserveEquipmentMsg.afterClosed().subscribe(() => {
                    const dialogDeliveryMethodMoment = this.dialog.open(DecisionTableModalComponent, {
                      disableClose: true,
                      data: 'MetodoEntregaMomento',
                    });
                    dialogDeliveryMethodMoment.afterClosed().subscribe(res => {
                      if (res.value.toUpperCase() === 'SI') {
                        const closeSaleMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.CloseSale);
                        closeSaleMsg.afterClosed().subscribe(() => {
                          this.CosmeticNoveltiesRule();
                        });
                      } else {
                        const deliveryMethodMomentDomicilie = this.dialog.open(DecisionTableModalComponent, {
                          disableClose: true,
                          data: 'MetodoEntregaDomicilio',
                        });
                        deliveryMethodMomentDomicilie.afterClosed().subscribe(res => {
                          if (res.value.toUpperCase() === 'SI') {
                            const selectedMethodWasHomeDelivery = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ScheduleVisit);
                            selectedMethodWasHomeDelivery.afterClosed().subscribe(async (res) => {
                              if (res) {
                                this.UpdateCaseManual()
                              }
                            })
                          } else {
                            this.UpdateCaseManual()
                          }
                        })
                      }
                    });
                  });
                }
              }
            });
          });
        }
      }
    })
  }
  private ValidateSellWithAccesories(): void {
    const dialogAccesories = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'Accesorios',
    });
    dialogAccesories.afterClosed().subscribe(res => {
      if (res) {
        if (res.value.toUpperCase() === 'NO') {
          this.guarantee.existInventory = false
          this.guarantee.nextMethod = 'ValidateFinancing';
          this.crmUtilService.SaveStep(this.guarantee);
          this.ValidateFinancing();
        } else {
          this.guarantee.enterWithAccessories = true //  POR EL MOMENTO ESTE VALOR VA EN TRUE
          // this.guarantee.enterWithAccessories = this.guarantee.odsOfCase.enterWithAccessories;
          if (this.guarantee.enterWithAccessories) {
            const enteredWithAccesoriesMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ClientWithAccesories);
            enteredWithAccesoriesMsg.afterClosed().subscribe(resp => {
              if (resp) {
                this.guarantee.nextMethod = 'ValidateReturnOfAccesories';
                this.crmUtilService.SaveStep(this.guarantee);
                this.ValidateReturnOfAccesories();
              }
            });
          }
        }
      }
    });
  }
  //DevuelveAccesorios
  private ValidateReturnOfAccesories(): void {
    //  this.guarantee.odsOfCase.accessoriesEntered = [{idAccessoriesEntered:4}, {idAccessoriesEntered:7}] //QUEMADO
    console.log('AccessoriesEntered', this.guarantee.odsOfCase.accessoriesEntered);

    //Busco y almaceno en un variable los accesorios que el cliente tiene para devolver.
    let arrayAccesories = '';
    this.guarantee.odsOfCase.accessoriesEntered.forEach((entry) => {
      arrayAccesories += ' - ' + this.listWarranty[0].value.find(item => item.id == entry.idAccessoriesEntered).description;
    });
    console.log('arrayAccesories ', arrayAccesories);
    // let accesoriesMessage = this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.AccessoriesMustReturn, arrayAccesories);

    //Envío variables en forma de objeto al componente modal para este caso particular
    let dataForComponent = { data: 'DevuelveAccesorios', value: arrayAccesories };
    const dialogReturnAccesories = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: dataForComponent,
    });
    dialogReturnAccesories.afterClosed().subscribe(resp => {
      if (resp) {
        if (resp.value === 'SI' && this.guarantee.odsOfCase.accessoriesEntered.length > 0) {
          const dialogDIB = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.AccesoriesRegistered);
          dialogDIB.afterClosed().subscribe(resp => {
            if (resp) {
              this.ValidateFinancing();
              this.guarantee.nextMethod = 'ValidateFinancing';
              this.crmUtilService.SaveStep(this.guarantee);
            }
          });
        } else {
          this.libknowledgeBase.searchByNameScript('NOESPOSIBLEREPARACION');
          this.libknowledgeBase.openKnowledgeBaseModal({ btnCancel: false, titleScript: false }).then(respKn => {
            this.sendMessage('ReturnAccesories');
            this.guarantee.nextMethod = 'CloseCase';
            this.crmUtilService.SaveStep(this.guarantee);
            this.CloseCase();
          });
        }
      }
    });
  }

  //Método para validar si tiene financiamiento
  private ValidateFinancing(): void {
    //evalua el parametro y si es operacion actual el  booleano sera true si es op inspira sera false
    this.guarantee.boolSourceOriginCurrentOperation ? this.ValidateRequestGetFinancing() : this.ValidateRequestGetFinancing();
  }

  private ValidateRequestGetFinancing(): void {
    // consumimos servicio GetFinancing
    const searchCriteria = sessionStorage.getItem('account');
    const searchType = 'PublicCustomerID';
    const returnActive = 'true';
    const wsValidateFinancing = this.parameters.URLSERVICIOSG.WsGetFinancingInfo;
    let dataTransform = {
      arrayData: [
        //header
        { name: 'startDate', value: this.util.ActualDate() },
        //body
        // {name: 'searchCriteria', value: '352028091110114'}, //QUEMADO
        { name: 'searchCriteria', value: searchCriteria },
        { name: 'searchType', value: searchType },
        { name: 'returnActive', value: returnActive }
      ]
    } as DataTransform;
    this.GetFinancingService(wsValidateFinancing.Url, wsValidateFinancing.Xml, dataTransform);
  }

  private GetFinancingService(urlString: string, xmlString: string, data: DataTransform): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetFinancingInfo - GetFinancingInfo', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        this.wsSoapService.wsSoap(urlString, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetFinancingInfo - GetFinancingInfo', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus[0]["status"][0]).toUpperCase() === "OK") {
                    this.wsSoapService.getObjectByElement(jsonResponse, 'financing').then(
                      (financingInfo) => {
                        if (financingInfo.length > 0) {
                          this.guarantee.financingInfo = JSON.parse(JSON.stringify(financingInfo));
                          if (this.guarantee.financingInfo[0]?.financingCode[0] !== undefined) {
                            this.guarantee.financedProduct = true;
                            this.AfterValidateFinancing();
                          } else {
                            this.guarantee.financedProduct = false;
                            this.AfterValidateFinancing();
                          }
                        } else {
                          this.guarantee.financedProduct = false;
                          this.AfterValidateFinancing();
                        }
                      }, (error) => {
                        this.guarantee.financedProduct = false;
                        this.AfterValidateFinancing();
                      }
                    );
                  } else {
                    this.guarantee.financedProduct = false;
                    this.AfterValidateFinancing();
                  }
                }
              )
            } catch (error) {
              this.guarantee.financedProduct = false;
              this.AfterValidateFinancing();
            }
          },
          (error) => {
            //Se valida si el error del ws es por data no encontrada o por un error real en el servidor
            if (this.parameters.WARRANTY_VALUES.AdmittedErrors500.find(x => error?.error?.includes(x))) {
              this.guarantee.financedProduct = false;
              this.AfterValidateFinancing();
            } else {
              this.custom.SetMessageError = 'Error en servicio para obtención de financiación: ';
              this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetFinancingInfo - GetFinancingInfo', valueTraza: error, error: true });
            }
          }
        )
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'GetFinancingInfo - GetFinancingInfo', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio para obtención de financiación: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);
      }
    );
  }
  public AfterValidateFinancing() {
    //this.guarantee.financedProduct = false; //QUEMADO
    // if (this.guarantee.financedProduct) {
    //   const decitionDialog = this.dialog.open(DecisionTableModalComponent, {
    //     disableClose: true,
    //     data: 'CancelaFinanciacion',
    //   });
    //   decitionDialog.afterClosed().subscribe(resp => {
    //    if (resp) {
    //     if (resp.value === 'Confirmar') {
    //     //evalua el parametro y si es operacion actual el  booleano sera true si es op inspira sera false
    //     this.guarantee.boolSourceOriginCurrentOperation ? this.GetFinancingReasonStatus() : this.GetFinancingReasonStatus();
    //     }
    //    }
    //   });
    // }
    if (this.guarantee.financedProduct) {
      if (sessionStorage.getItem("existeDisponibilidad") == 'true') {
        const decitionDialog = this.dialog.open(DecisionTableModalComponent, {
          disableClose: true,
          data: 'FinanciacionActualizacionDatos',
        });
      } else {
        const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.YesFinanced)
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            const dialogNotFin = this.dialog.open(BilledChargesModalComponent, {
              disableClose: true,
              data: this.guarantee,
            });
          }
        })
      }
    } else {
      if (this.guarantee.selectedCase.equipment.imei != '') {
        const dialogRef = this.util.getMessageModal('El producto móvil no fue adquirido por financiación, cuenta con IMEI asociado y se procederá a realizar cambio de titularidad');
        dialogRef.afterClosed().subscribe(res => {
          if (res) {
            this.guarantee.odsMethod = 'ValidateFinancing';
            this.crmUtilService.SaveStep(this.guarantee);
            localStorage.setItem("redirectChangeOwnership", 'true');
            //this.RedirectChangeOwnership(true);
            let wsSendMessageModification = this.parameters.URLSERVICIOSG.WsSendMessageModification;

            //QUEMADO mientras se define de donde se obtiene la informacion PBI_1761 CAMBIO DE TITULARIDAD FLUJO 48 CR190
            let dataTransform = {
              arrayData: [
                //header
                { name: 'startDate', value: this.util.ActualDate() },
                //body
                { name: 'imei', value: '357079108781314' },
                { name: 'tipoUsuarioPropietario', value: 2 },
                { name: 'tipoDocPropietario', value: 3 },
                { name: 'numIdPropietario', value: '800252729-3' },
                { name: 'imsi', value: '732101567980676' },
                { name: 'msisdn', value: '3229454549' },
                { name: 'direccionAutorizado', value: 'calle 146 # 12 a 49' },
                { name: 'direccionPropietario', value: 'Carrera 68 A # 24 B-10' },
                { name: 'nombreAutorizado', value: 'Elizabeth Hull' },
                { name: 'nombrePropietario', value: 'COMUNICACION CELULAR SA COMCEL SA' },
                { name: 'numIdAutorizado', value: '74747321' },
                { name: 'telContactoAutorizado', value: '3146734469' },
                { name: 'telContactoPropietario', value: 1 },
                { name: 'tipoDocAutorizado', value: 2 },
                { name: 'tipoUsuarioAutorizado', value: 1 },
                { name: 'custCode', value: 1 },
                { name: 'coId', value: 1 },
                { name: 'customerId', value: 1 },
                { name: 'minExcluido', value: 1 },
                { name: 'equipoTraido', value: 1 },
                { name: 'direccionIP', value: 1 },
                { name: 'proceso', value: 1 },
                { name: 'tmCode', value: 1 },
                { name: 'spCode', value: 1 },
                { name: 'origenPago', value: 1 },
                { name: 'tipoLinea', value: 1 },
                { name: 'idCCid', value: 1 },
                { name: 'direccionValidada', value: 1 },
                { name: 'telefonoValidado', value: 1 },
                { name: 'departamento', value: 1 },
                { name: 'ciudad', value: 1 },
                { name: 'barrio', value: 1 }
              ]
            } as DataTransform;

            this.ConsumeWsSendMessageModification(wsSendMessageModification.Url, wsSendMessageModification.Xml, dataTransform);
          }
        })
      } else {
        const dialogNotFin = this.dialog.open(InformativeModalComponent, {
          disableClose: true,
          data: this.parameters.WARRANTY_MESSAGES.NotFinanced,
          id: 'fail-alert',
        });
        dialogNotFin.afterClosed().subscribe(resp => {
          if (resp) {
            this.guarantee.nextMethod = 'ODCGenerated';
            this.guarantee.odsMethod = 'ValidateFinancing';
            this.crmUtilService.SaveStep(this.guarantee);
            this.pdfFormat.GetODSFormat(this.guarantee.selectedCase.idOds)
            localStorage.setItem("positiveBalance", 'true');            
          }
        });
      }
    }
  }
  //Traer reason id de cancelacion
  private GetFinancingReasonStatus(): void {
    const messageError = this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.NotAssociatedInformation, 'reasonId de Cancelación')

    let wsFinancigReason = this.parameters.URLSERVICIOSG.WsFinancigReason;
    let dataTransform = {
      arrayData: [
        //header
        { name: 'startDate', value: this.util.ActualDate() },
        //body
        { name: 'status', value: this.parameters.GENERALS_48.statusReasonCancell },
      ]
    } as DataTransform;

    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', dataTraza: wsFinancigReason.Xml });
    this.wsSoapService.getDataXMLTrans(wsFinancigReason.Xml, dataTransform).then(
      (xml) => {
        // return this.AfterCancellFinanciation(); //QUEMADO
        this.wsSoapService.wsSoap(wsFinancigReason.Url, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus[0]["status"][0]).toUpperCase() === "OK") {
                    this.wsSoapService.getObjectByElement(jsonResponse, 'reason').then(
                      (reasonId) => {
                        if (reasonId.length > 0) {
                          const result = reasonId[0];
                          if (result !== undefined) {
                            this.guarantee.reasonId = String(result);
                            this.SetRequestCancellFinancig();
                          } else {
                            this.util.OpenAlert(messageError, false);
                          }
                        } else {
                          this.util.OpenAlert(messageError, false);
                        }
                      }, (error) => {
                        this.util.OpenAlert(messageError, false);
                      }
                    );
                  } else {
                    this.util.OpenAlert(messageError, false);
                  }
                }
              )
            } catch (error) {
              this.util.OpenAlert(messageError, false);
            }
          },
          (error) => {
            this.util.OpenAlert('El servicio (wsFinancigReason) esta respondiendo con el siguiente error: ' + error.name, false);
            // this.AfterCancellFinanciation();//para pruebas
            this.util.OpenAlert('El servicio (wsFinancigReason) esta respondiendo con el siguiente error: ' + error.name, false);
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', valueTraza: error, error: true });
            // this.util.OpenAlert(messageError,false);
            this.custom.SetMessageError = 'Error en servicio para obtener la razón de la financiación';
          }
        )
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio para codigo de financiación: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);
      }
    );

  }
  private SetRequestCancellFinancig(): void {
    let wsCancellFinancing = this.parameters.URLSERVICIOSG.WsCancelFinancing;
    // la anterior linea se deja provisional cuando se entregue a everis validar con la linea comentariada abajo
    //wsCancellFinancing.Xml = this.util.StringFormat(wsCancellFinancing.Xml, this.guarantee.financingInfo[0].chargeBillingAccount[0].$.id, this.guarantee.financingInfo[0]?.chargeBillingAccount[0]?._); Se cambia consumo CancelFinancing temporalmente hasta validar el consumo correcto del servicio.
    wsCancellFinancing.Xml = this.util.StringFormat(wsCancellFinancing.Xml, this.guarantee.financingInfo[0].accountNumber[0].$.id, sessionStorage.getItem('account'));
    let dataTransform = {
      arrayData: [
        //header
        { name: 'startDate', value: this.util.ActualDate() },
        //body
        { name: 'financingCode', value: this.guarantee.financingInfo[0]?.financingCode[0] },
        { name: 'reasonId', value: this.guarantee.reasonId },
        { name: 'validFrom', value: this.util.ActualDate() },
        { name: 'userName', value: this.guarantee.idUser },
      ]
    } as DataTransform;
    this.CancelFinanciationService(wsCancellFinancing.Url, wsCancellFinancing.Xml, dataTransform);
  }
  //Metodo para consumir servicio de cancelacion de financiacion
  private CancelFinanciationService(urlString: string, xmlString: string, data: DataTransform): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        // return this.AfterCancellFinanciation(); //QUEMADO
        this.wsSoapService.wsSoap(urlString, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus[0]["status"][0]).toUpperCase() === "OK") {
                    this.wsSoapService.getObjectByElement(jsonResponse, 'resultDesc').then(
                      (resultDesc) => {
                        if (resultDesc.length > 0) {
                          const result = resultDesc[0];
                          if (result !== undefined && result.includes('sin errores')) {
                            this.AfterCancellFinanciation();
                          } else {
                            this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente', false);
                          }
                        } else {
                          this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente', false);
                        }
                      }, (error) => {
                        this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente', false);
                      }
                    );
                  } else {
                    this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente', false);
                  }
                }
              )
            } catch (error) {
              this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente', false);
            }
          },
          (error) => {
            // this.AfterCancellFinanciation();//para pruebas
            this.util.OpenAlert('Error en el servicio por favor vuelva a ejecutar el proceso', false);
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', valueTraza: error, error: true });
            // this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente',false);
            this.custom.SetMessageError = 'Error en servicio para obtención de financiación';
          }
        )
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio para obtención de financiación: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);
      }
    );
  }
  private AfterCancellFinanciation(): void {
    const dialogRef = this.dialog.open(InformativeModalComponent, {
      disableClose: true,
      data: 'Financiación anulada con éxito',
      id: 'success-alert',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        this.guarantee.nextMethod = 'ODCGenerated';
        this.guarantee.odsMethod = 'ValidateFinancing';
        this.crmUtilService.SaveStep(this.guarantee);
        this.pdfFormat.GetODSFormat(this.guarantee.selectedCase.idOds)
      }
    });
  }

  // Método para mostrar regla para preguntar si existen novedades cosmeticas
  private CosmeticNoveltiesRule(): void {
    if (!this.guarantee.originByFail || this.guarantee.originByFail == undefined) {
      const requestEquipmentMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.RequestEquipment);
      requestEquipmentMsg.afterClosed().subscribe(resp => {
        if (resp) {
          const deliverToCustomerMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.DeliverToCustomer);
          deliverToCustomerMsg.afterClosed().subscribe(resp => {
            if (resp) {
              this.InstanceOfCosmeticQuestion();
            }
          });
        }
      });
    } else {
      this.InstanceOfCosmeticQuestion();
    }
    this.guarantee.originByFail == undefined; //Se inicializa
  }

  private noDeadInBoxRule = () => {
    // NO SE CUMPLIERON LOS TIEMPOS ESTABLECIDOS PARA ENTREGA DEL EQUIPO
    // this.guarantee.selectedCase.daysCurrentState  =  this.guarantee.cavInfo.serviceTime + 10 //QUEMADO
    this.deliveryTimes.CountDaysByDates(this.guarantee.cavInfo.serviceTime, this.guarantee.selectedCase.daysCurrentState)
      .subscribe(responseOK => {
        if (responseOK) {
          if (this.warrantyService.getBreachTimeDays > 0) {
            const dialogCSTIncumplio = this.dialog.open(DecisionTableModalComponent, {
              disableClose: true,
              data: 'CSTIncumplio',
            });
            dialogCSTIncumplio.afterClosed().subscribe(resp => {
              if (resp) {
                this.guarantee.showMemorandumFormat = true
                this.pdfFormat.GetODSFormat(this.guarantee.odsOfCase.idOds, FormatTemplate.NonComplianceFormat)
              }
            })
          } else {
            console.log('CST cumplió  - flujo no indica que hacer')
          }
        } else {
          if (this.custom.GetCountError() <= environment.ic) {
            this.noDeadInBoxRule();
          } else {
            this.custom.DelCountError();
          }
        }
      });
  }

  private InstanceOfCosmeticQuestion(): void {
    const dialogRef = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'Inconsistencias',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (resp.value === 'NO') {
          this.guarantee.odsMethod = 'CosmeticNoveltiesRule';
          if (this.guarantee.nameCaseStateSelected === ODSStates.ReceivedOriginPoint || this.guarantee.nameCaseStateSelected === ODSStates.InRepair || this.guarantee.nameCaseStateSelected === ODSStates.EquipmentChange || this.guarantee.nameCaseStateSelected === ODSStates.Repared || this.guarantee.nameCaseStateSelected === ODSStates.SentToSource) {
            this.guarantee.isCloseCase = true;
            this.guarantee.nextMethod = 'UpdateCaseManual';
            this.guarantee.isCloseCasePayment = false;
            this.crmUtilService.SaveStep(this.guarantee);
            //this.ClientReceiveEquipment();
            this.UpdateCaseManual();
          } else {
            this.guarantee.nextMethod = 'ODCGenerated';//Cambie GetODS
            this.crmUtilService.SaveStep(this.guarantee);
            this.pdfFormat.GetODSFormat(this.guarantee.selectedCase.idOds)
          }
        } else {
          // la siguiente linea quema la data del escenario pra pruebas, comentariar cuando no se necesite
          // this.guarantee.odsOfCase.repairEquipmentWithCost = false;this.guarantee.odsOfCase.repairState = RepairState.ReparedWithNoCost; this.guarantee.odsOfCase.equipChange = true;this.guarantee.odsOfCase.law1480Applies = true;//QUEMADO
          if (this.guarantee.odsOfCase.repairEquipmentWithCost) {
            const dialogInfo = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.RepairedWithCost)
            dialogInfo.afterClosed().subscribe(resp => {
              if (resp) {
                this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.RedirectCSTManagementSite)
                  .afterClosed().subscribe(resp => { if (resp) { this.disabledQuery = true } })

              }
            })
          } else if (!this.guarantee.odsOfCase.repairEquipmentWithCost
            && this.guarantee.nameCaseStateSelected === ODSStates.ReceivedOriginPoint &&
            // por confirmar si solo es recibido en punto de origen
            this.guarantee.odsOfCase.equipChange || this.guarantee.odsOfCase.law1480Applies) {
            this.guarantee.repairedWithCost = false;
            const dialogReparedWithOutCost = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.RepairedWithouthCost)
            dialogReparedWithOutCost.afterClosed().subscribe(resp => {
              if (resp) {
                this.guarantee.nextMethod = 'ValidateFailures';
                this.crmUtilService.SaveStep(this.guarantee);
                this.ValidateFailures();
              }
            });
          } else if (!this.guarantee.odsOfCase.repairEquipmentWithCost &&
            !this.guarantee.odsOfCase.equipChange && !this.guarantee.odsOfCase.law1480Applies) {
            this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.RepairedWithouthCost)
              .afterClosed().subscribe(resp => {
                if (resp) {
                  this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.NoRepairedByLaw1480)
                    .afterClosed().subscribe(resp => {
                      if (resp) {
                        //this.guarantee.odsOfCase.doa = true //QUEMADO
                        if (!this.guarantee.odsOfCase.doa) {
                          this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.NoDeadInBox)
                            .afterClosed().subscribe(resp => {
                              if (resp) {
                                this.externaslService.getSuccessFactorInfo(this.guarantee).then(res => {
                                  if (res) {
                                    this.guarantee.successFactorInfo = res;
                                    if (res.salePoint !== undefined && res.salePoint !== '' && res.salePoint !== null) {
                                      if (!this.guarantee.cavInfo) {
                                        this.InstanceOfCosmeticQGetCAV();
                                      } else this.noDeadInBoxRule()
                                    } else this.noDeadInBoxRule()
                                  }
                                })
                              }
                            })
                        } else {// si es muerto en caja por equipo en ventas
                          const dialogDIB = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.DeadInBoxEquipment);
                          dialogDIB.afterClosed().subscribe(resp => {
                            if (resp) {
                              this.ValidateInventory();
                            }
                          });
                        }
                      }
                    });
                }
              })
          }
        }
      }
    });
  }

  private InstanceOfCosmeticQGetCAV(): void {
    this.externaslService.GetCavByName(this.guarantee.successFactorInfo.salePoint).subscribe((respCav: CavServiceResponse) => {
      this.custom.DelCountError();
      this.guarantee.cavInfo = (respCav.response.isValid) ? respCav.cavs[0] : undefined
      this.noDeadInBoxRule()
    }, error => {
      this.custom.AddCountError();
      if (this.custom.GetCountError() <= environment.ic) {
        this.InstanceOfCosmeticQGetCAV(); //Vuelve a consumir el ws para que haya respuesta
      } else {
        this.custom.DelCountError();
      }
    })
  }
  private ValidateFailures(): void {
    if (!this.checkedCav) this.guarantee.cavInfo = undefined;
    if (this.guarantee.cavInfo === undefined) {
      this.externaslService.getSuccessFactorInfo(this.guarantee).then(res => {
        if (res) {
          this.guarantee.successFactorInfo = res;
          if (res.salePoint !== undefined && res.salePoint !== '' && res.salePoint !== null) {
            this.externaslService.GetCavByName(this.guarantee.successFactorInfo.salePoint).subscribe((respCav: CavServiceResponse) => {
              this.custom.DelCountError();
              if (respCav.response.isValid && respCav.cavs && respCav.cavs.length > 0 && respCav.cavs[0].model === ModalityCav.Presencial) {
                this.guarantee.cavInfo = respCav.cavs[0];
                sessionStorage.setItem('codeCav', this.guarantee.cavInfo.codeCav.toString());
                this.checkedCav = true;
                this.ValidateFailures();
              } else {
                this.guarantee.nextMethod = 'ValidateClaroPointRule';
                this.crmUtilService.SaveStep(this.guarantee);
                this.ValidateClaroPointRule();
              }
            }, error => {
              this.custom.AddCountError();
              if (this.custom.GetCountError() <= environment.ic) {
                this.ValidateFailures(); //Vuelve a consumir el ws para que haya respuesta
              } else {
                this.custom.DelCountError();
              }
            });
          } else {
            this.guarantee.nextMethod = 'ValidateClaroPointRule';
            this.crmUtilService.SaveStep(this.guarantee);
            this.ValidateClaroPointRule();
          }
        }
      });
    } else {
      if (this.guarantee.cavInfo !== undefined && this.guarantee.odsOfCase.law1480Applies || this.guarantee.odsOfCase.equipChange) {
        const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.RepairedByLaw1480);
        dialogMsg.afterClosed().subscribe(resp => {
          if (resp) {
            //Pregunto si Presenta falla   //PresentaFalla
            const dialogRef = this.dialog.open(DecisionTableModalComponent, {
              disableClose: true,
              data: 'PresentaFalla',
            });
            dialogRef.afterClosed().subscribe(resp => {
              if (resp) {
                if (String(resp.value).toUpperCase() === 'NO') {
                  this.guarantee.nextMethod = 'CosmeticNoveltiesRule';
                  this.crmUtilService.SaveStep(this.guarantee);
                  const dialogAssesor = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.DeliverEquipmenttoAssesor);
                  dialogAssesor.afterClosed().subscribe(resp => {
                    if (resp) {
                      const dialogHomologation = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.DeliverToCustomer);
                      dialogHomologation.afterClosed().subscribe(close => {
                        if (close) {
                          this.guarantee.originByFail = true;
                          this.CosmeticNoveltiesRule();
                        }
                      });
                    }
                  });
                } else {
                  this.guarantee.nextMethod = 'ValidateInventory';
                  this.crmUtilService.SaveStep(this.guarantee);
                  this.ValidateInventory();
                }
              }
            });
          }
        });
      }
    }

  }
  private ValidateClaroPointRule(): void {
    const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.OnlyRepaired);
    dialogMsg.afterClosed().subscribe(resp => {
      if (resp) {
        //Pregunto si es punto directo claro y puede gestionar
        const dialogRef = this.dialog.open(DecisionTableModalComponent, {
          disableClose: true,
          data: 'PuntoDirectoClaro',
        });
        dialogRef.afterClosed().subscribe(respRule => {
          if (respRule) {
            if (String(respRule.value).toUpperCase() === 'NO') {
              const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.WarrantyTransact);
              this.disabledQuery = true;
            } else {
              this.ValidateInventory();
            }
          }
        })
      }
    });
  }

  //Stock Modal
  private UpdateCaseManual() {
    this.ConsultCaseAsync().then(() => {
      // this.guarantee.odsOfCase.repairEquipmentWithCost = false;this.guarantee.odsOfCase.repairState = RepairState.ReparedWithNoCost; this.guarantee.odsOfCase.equipChange = false;this.guarantee.odsOfCase.law1480Applies = false;//QUEMADO
      this.guarantee.selectedCase.paymentNotMade = "";
      if (this.guarantee.isCloseCase === undefined) this.guarantee.isCloseCase = true;
      if (this.guarantee.updateODS === undefined) this.guarantee.updateODS = true;
      //consult ods sera para enviar por si no deseaa consultar ODS
      this.guarantee.consultODS === undefined ? this.guarantee.consultODS = true : this.guarantee.consultODS = this.guarantee.consultODS
      this.guarantee.odsOfCase.updateODS = this.guarantee.updateODS;

      // this.guarantee.originStorer = true;
      // this.guarantee.selectedCase.repairEquipmentWithCost = false;
      const dialogDetail = this.dialog.open(InternalCaseDetailComponent, {
        disableClose: true,
        data:
        {
          selectedCase: this.guarantee.selectedCase,
          odsOfCase: this.guarantee.odsOfCase,
          listCaseStates: this.listCaseStates,
          isCloseCase: this.guarantee.isCloseCase,
          consultODS: this.guarantee.consultODS,
          originStorer: this.guarantee.originStorer,
          positiveBalance: this.guarantee.positiveBalance,
          showMemorandumFormat: this.guarantee.showMemorandumFormat,
          cosmeticInconsistencies: this.guarantee.isCloseCasePayment
        }
      });
      dialogDetail.afterClosed().subscribe(resp => {
        if (resp) {
          this.guarantee.isCloseCase = undefined; //Se inicializa
          this.guarantee.updateODS = undefined; //Se inicializa
          if (resp == true) {
            resp = { resp: true, ods: this.guarantee.odsOfCase };
          }
          this.guarantee.odsResponses.find(x => x.idOds === resp.ods?.idOds).state = resp.ods?.state;
          this.listODS = new MatTableDataSource(this.guarantee.odsResponses);
          if (this.guarantee.originStorer) {//cierre de atencion
            this.CloseTransaction();
          } else {
            if (this.guarantee.odsMethod === 'CosmeticNoveltiesRule') {// va por camino RPO reglas cosmeticas
              this.guarantee.nextMethod = 'ODCGenerated';
              this.guarantee.odsMethod = 'UpdateCaseManual';
              this.crmUtilService.SaveStep(this.guarantee);
              this.ConsultCase(false)
              this.pdfFormat.GetODSFormat(this.guarantee.selectedCase.idOds)
            }
            else {
              if (this.guarantee.odsMethod === 'AfterValidatePaymentReferences') {
                this.sendMessage('Refund');
              } else if (this.guarantee.odsMethod === 'ReturnEquipmentRule') {
                this.guarantee.inBadCondition ? this.sendMessage('PaymentReceived') : this.sendMessage('EquipmentReceived')
              }
              else {
                this.sendMessage('PaymentReceived');
                this.ValidateFinancing();
              }
            }
          }
        }
      });
    }, error => {
      this.util.OpenAlert('Error en el servicio por favor vuelva a ejecutar el proceso', false);
    });
  }

  //Método orquestados para continuar con flujo luego de generar ODS de acuerdo al estado del caso
  private ODCGenerated(): void {
    var redirectChangeOwnership = localStorage.getItem("redirectChangeOwnership") == 'true';
    if (redirectChangeOwnership) {
      localStorage.setItem("redirectChangeOwnership", 'false');
      const dialogMsg = this.dialog.open(DecisionTableModalComponent, {
        disableClose: true,
        data: 'CargueDocumentos',
      });
      dialogMsg.afterClosed().subscribe(resp => {
        if (resp) {
          if (resp.value.toUpperCase() === 'SI' && resp.ruleName === 'CargueDocumentos') {
            const validCaseStates = [
              ODSStates.Closed, ODSStates.RefundMoney, ODSStates.EquipmentChange,
              ODSStates.PaymentNotMade, ODSStates.ClientNotReceiveEquipment, ODSStates.SentToHome,
              ODSStates.WarrantyNoCover, ODSStates.Irreparable, ODSStates.NotifySupplier,
              ODSStates.InRepair, ODSStates.Repared, ODSStates.SentToSource, ODSStates.ReceivedOriginPoint
            ]
            const exists = validCaseStates.find(x => x === this.guarantee.nameCaseStateSelected)
            if (exists) {
              this.guarantee.odsMethod = 'ValidateSapInventoryImei';
              this.guarantee.nextMethod = 'LoadedFiles';
              this.guarantee.showDocumentalManager = true;
              this.crmUtilService.SaveStep(this.guarantee);
              this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.RememberFiles, true);
            } else {
              this.guarantee.showDocumentalManager = false;
              this.guarantee.odsMethod === 'ValidateFinancing' ? this.guarantee.nextMethod = 'ValidatePositiveBalance' : this.guarantee.nextMethod = 'ClientReceiveEquipment';
              this.crmUtilService.SaveStep(this.guarantee);
              this.guarantee.odsMethod === 'ValidateFinancing' ? this.ValidatePositiveBalance() : this.ClientReceiveEquipment();
            }
          } else {
            this.ValidateSapInventoryImei();
          }
        }
      });
    } else {
      var positiveBalance = localStorage.getItem("positiveBalance") == 'true';
      if (positiveBalance) {
          localStorage.setItem("positiveBalance", 'false');
          if (this.guarantee.positiveBalance) {
            this.crmUtilService.SaveStep(this.guarantee)
            const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.redirectMoneyRefound);
            dialogMsg.afterClosed().subscribe(resp => {
              if (resp) {          
                this.showShoppingCart(true,'notFinancing');
              }
            })
          } else {
            this.guarantee.positiveBalance = false;
            const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.NotFavorBalance);
            dialogRef.afterClosed().subscribe(resp => {
              if (resp) {
                this.crmUtilService.SaveStep(this.guarantee);
                this.showShoppingCart(false,'notFinancing');
              }
            });
          }
      } else {
        if (this.guarantee.showMemorandumFormat) {
          this.UpdateCaseMemorandum()
          this.guarantee.showMemorandumFormat = false
          return
        }
        this.guarantee.nameCaseStateSelected = this.listCaseStates.find(caseItem => caseItem.id === this.guarantee.selectedCase.state).name;
        if (this.guarantee.odsMethod === 'UpdateCaseManual' || this.guarantee.odsMethod === 'ValidateFinancing') {
          this.guarantee.nextMethod = 'SendEmailODS';
          this.crmUtilService.SaveStep(this.guarantee);
          ///Pregunta aca si desea envio de ods por correo
          const dialogRef = this.dialog.open(DecisionTableModalComponent, {
            disableClose: true,
            data: 'EnvioODS',
          });
          dialogRef.afterClosed().subscribe(resp => {
            if (resp) {
              if (String(resp.value).toUpperCase() === 'NO') {
                // En caso de que no desee ods por correo habilita gestor documental
                const validCaseStates = [
                  ODSStates.Closed, ODSStates.RefundMoney, ODSStates.EquipmentChange,
                  ODSStates.PaymentNotMade, ODSStates.ClientNotReceiveEquipment, ODSStates.SentToHome,
                  ODSStates.WarrantyNoCover, ODSStates.Irreparable, ODSStates.NotifySupplier,
                  ODSStates.InRepair, ODSStates.Repared, ODSStates.SentToSource, ODSStates.ReceivedOriginPoint
                ]
                const exists = validCaseStates.find(x => x === this.guarantee.nameCaseStateSelected)
                if (exists) {
                  this.guarantee.nextMethod = 'LoadedFiles';
                  this.guarantee.showDocumentalManager = true;
                  this.crmUtilService.SaveStep(this.guarantee);
                  this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.RememberFiles, true);
                } else {
                  this.guarantee.showDocumentalManager = false;
                  this.guarantee.odsMethod === 'ValidateFinancing' ? this.guarantee.nextMethod = 'ValidatePositiveBalance' : this.guarantee.nextMethod = 'ClientReceiveEquipment';
                  this.crmUtilService.SaveStep(this.guarantee);
                  this.guarantee.odsMethod === 'ValidateFinancing' ? this.ValidatePositiveBalance() : this.ClientReceiveEquipment();
                }
              }
              else {
                this.guarantee.nextMethod = 'SendEmailODS';
                this.crmUtilService.SaveStep(this.guarantee);
                this.SendEmailODS();
              }
            }
          })
  
        } else { // Se generó ODS desde otros metodos
          this.guarantee.nextMethod = 'ClientReceiveEquipment';
          this.crmUtilService.SaveStep(this.guarantee);
          this.ClientReceiveEquipment();
        }
      }
    }
  }

  private IsMovilEquipmentRule() {
    const dialogEsEquipoMovil = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'EsEquipoMovil',
    });
    dialogEsEquipoMovil.afterClosed().subscribe((res) => {
      if (res) {
        if (res.value === "NO" && res.ruleName === 'RecibeEquipo') { //No - de pregunta Cliente recibe equipo
          let request = this.warrantyService.GetUpdateODSRequest({ odsOfCase: this.guarantee.odsOfCase, selectedCase: this.guarantee.selectedCase })
          request.clientNotReceiveEquipment = true;
          const odsRequestToUpd = new ODSRequest();
          odsRequestToUpd.headerRequest = HEADER_REQUEST;
          odsRequestToUpd.idOds = this.guarantee.odsOfCase.idOds;
          this.warrantyService.GetODS(odsRequestToUpd).subscribe(respODS => {
            if (respODS.isValid) {
              const ODSAsociated = respODS.odsResponse[0];
              request.equipmentOnLoan = ODSAsociated.equipmentOnLoan;
              request.service = ODSAsociated.service;
              request.doa = ODSAsociated.doa;
              request.equipLoan = ODSAsociated.equipLoan;
              request.loanType = ODSAsociated.loanType;
              request.attentionCenter = ODSAsociated.attentionCenter;
              request.lineSuspension = ODSAsociated.lineSuspension;
              request.distributor = ODSAsociated.distributor;
              request.comments = ODSAsociated.comments;
              request.lineSuspensionI = ODSAsociated.lineSuspensionI;
              request.equipLoanI = ODSAsociated.equipLoanI;
              request.detail = ODSAsociated.detail;
              request.delivery = ODSAsociated.delivery;
              request.sympton = ODSAsociated.sympton;
              request.repair = ODSAsociated.repair;
              request.reviewed = ODSAsociated.reviewed;
              request.reviewDate = ODSAsociated.reviewDate;
              request.repairDate = ODSAsociated.repairDate;
              if (ODSAsociated.newEquipment) {
                let newEq: NewEquipment = { imei: ODSAsociated.newEquipment.imei, serial: ODSAsociated.newEquipment.serial, brand: ODSAsociated.newEquipment.brand, model: ODSAsociated.newEquipment.model, sap: ODSAsociated.newEquipment.sap };
                request.newEquipment = newEq;
              } else request.newEquipment = null;
              request.equipChange = ODSAsociated.equipChange;
              ODSAsociated.part?.length > 0 ? request.part = ODSAsociated.part : request.part = [];
              ODSAsociated.qualitystate?.length > 0 ? request.qualitystate = ODSAsociated.qualitystate : request.qualitystate = [];
              request.responseLaw = ODSAsociated.responseLaw;
              request.requiresWithdrawalForm = ODSAsociated.requiresWithdrawalForm;
              request.invoiceDate = ODSAsociated.invoiceDate;
              request.enterWithAccessories = ODSAsociated.enterWithAccessories;
              ODSAsociated.accessoriesEntered?.length > 0 ? request.accessoriesEntered = ODSAsociated.accessoriesEntered : request.accessoriesEntered = [];
              request.equipmentType = ODSAsociated.equipmentType;
              request.repairState = ODSAsociated.repairState;
              request.entryPerWarranty = ODSAsociated.entryPerWarranty;
              request.processedWarrantySameFailure = ODSAsociated.processedWarrantySameFailure;
              request.repairEquipmentWithCost = ODSAsociated.repairEquipmentWithCost;
              request.warrantyAppliesCompensation = ODSAsociated.warrantyAppliesCompensation;
              request.equipmentImpactsBrokenScreen = ODSAsociated.equipmentImpactsBrokenScreen;
              request.equipmentWithoutLabelSerial = ODSAsociated.equipmentWithoutLabelSerial;
              request.commentsCosmeticReviewStatus = ODSAsociated.commentsCosmeticReviewStatus;
              request.totalValueRepair = ODSAsociated.totalValueRepair;
              request.clientReturnEquipmentLoan = ODSAsociated.clientReturnEquipmentLoan;
              request.reviewEquipmentLoanWasApproved = ODSAsociated.reviewEquipmentLoanWasApproved;
              request.descriptionAccessoriesEnterWarranty = ODSAsociated.descriptionAccessoriesEnterWarranty;
              request.law1480Applies = ODSAsociated.law1480Applies;
              request.applyEquipmentChange = ODSAsociated.applyEquipmentChange;
              request.moneyBackApplies = ODSAsociated.moneyBackApplies;
              request.moneyRefundMade = ODSAsociated.moneyRefundMade;
              request.repairedBy = ODSAsociated.repairedBy;
              request.faultFixedByBarTechnician = ODSAsociated.faultFixedByBarTechnician;
              request.clientSatisfiedBarTechnicianSolution = ODSAsociated.clientSatisfiedBarTechnicianSolution;
              request.customerDisagreementDetails = ODSAsociated.customerDisagreementDetails;
              request.idUserDiagnosis = ODSAsociated.idUserDiagnosis;
              request.idTechnicalDiagnosis = ODSAsociated.idTechnicalDiagnosis;
              request.diagnosticObservations = ODSAsociated.diagnosticObservations
              request.paymentMethod = ODSAsociated.paymentMethod;
              request.paymentConcept = ODSAsociated.paymentConcept;
              request.equipmentUnderWarranty = ODSAsociated.equipmentUnderWarranty;
              request.equipmentPresentedRealFault = ODSAsociated.equipmentPresentedRealFault;
              request.firstContactDate = ODSAsociated.firstContactDate;
              request.equipmentEntryDate = ODSAsociated.equipmentEntryDate;
              request.receiveReturnedProduct = ODSAsociated.receiveReturnedProduct;
              //request provisional
              this.externaslService.UpdateODS(request).subscribe(responseUpdate => {
                if (responseUpdate.isValid) {
                  this.guarantee.nextMethod = 'DeliverEquipmentCSTStoreman';
                  this.crmUtilService.SaveStep(this.guarantee);
                  this.DeliverEquipmentCSTStoreman();
                } else {
                  this.util.OpenAlert(responseUpdate.message, false);
                }
              });
            } else {
              this.util.OpenAlert(respODS.message, false);
            }
          });
        } else { // No - de pregunta es cambio de equipo
          this.guarantee.nextMethod = 'CloseCase';
          this.guarantee.odsMethod = 'ClientReceiveEquipment';
          this.crmUtilService.SaveStep(this.guarantee);
          this.guarantee.hasToPay ? this.sendMessage('PaymentReceived') : this.sendMessage('EquipmentReceived');;
          this.CloseCase();
        }
      }
    })
  }

  private DeliverEquipmentCSTStoreman() {
    this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.DeliverEquipmentCSTStoreman)
      .afterClosed().subscribe(resp => {
        if (resp) {
          this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.RedirectCSTManagementSite)
            .afterClosed().subscribe(resp => { if (resp) { this.disabledQuery = true } })
        }
      })
  }

  private ConsultCaseAsync(): Promise<void> {
    return new Promise((resolve) => {
      let odsRequest = { headerRequest: HEADER_REQUEST, idOds: this.guarantee.selectedCase.idOds }
      let caseRequest = { headerRequest: HEADER_REQUEST, idInternalCase: this.guarantee.selectedCase.idInternalcase }
      zip(this.warrantyService.GetODS(odsRequest), this.externaslService.GetCase(caseRequest))
        .subscribe(([ods, internalcases]) => {
          this.custom.DelCountError();
          console.log('ods resp service', ods);
          let caseAssociated;
          if (ods.isValid) {
            this.guarantee.selectedCase.state = ods.odsResponse[0].state;
            this.guarantee.enterWithAccessories = ods.odsResponse[0].enterWithAccessories;
            if (internalcases.internalCaseResponse.length > 0) {
              caseAssociated = internalcases.internalCaseResponse.find(caseItem => caseItem.idInternalCase === ods.odsResponse[0].idInternalCase)
            } else {
              caseAssociated = internalcases.internalCaseResponse;
            }
          } else {
            this.util.OpenAlert('Error en el servicio, no se recibieron los parámetros esperados en el Request', false);
          }

          this.guarantee.selectedCase.clientNotReceiveEquipment = ods.odsResponse[0].clientNotReceiveEquipment;
          //Check de memorando true - false
          console.log('Internal Case Data', caseAssociated);
          this.guarantee.selectedCase.breachOfTime = caseAssociated.breachOfTime;
          this.guarantee.selectedCase.stock = caseAssociated.stock;
          this.guarantee.selectedCase.priority = caseAssociated.priority;
          this.guarantee.selectedCase.madeCashPayment = caseAssociated.madeCashPayment
          this.guarantee.selectedCase.paidStorage = caseAssociated.paidStorage
          this.guarantee.nameCaseStateSelected = this.listCaseStates.find(caseState => caseState.id === this.guarantee.selectedCase.state).name;
          resolve()
        }, error => {
          this.custom.AddCountError();
          console.log('error ConsultCaseAsync', error);
          this.util.OpenAlert('Error en el servicio, no fue posible obtener la información de la ODS/Caso Interno', false);
          // if(this.custom.GetCountError() <= environment.ic){
          //   this.ConsultCaseAsync();
          // } else{
          //   // this.custom.DelCountError();
          //   this.util.OpenAlert('Error en el servicio, no fue posible obtener la información de la ODS/Caso Interno', false);
          // }
        })
    })

  }

  private UpdateCaseMemorandum(): void {
    this.ConsultCaseAsync().then(() => {
      this.guarantee.selectedCase.paymentNotMade = "";
      const dialogDetail = this.dialog.open(InternalCaseDetailComponent, {
        disableClose: true,
        data:
        {
          selectedCase: this.guarantee.selectedCase,
          odsOfCase: this.guarantee.odsOfCase,
          listCaseStates: this.listCaseStates,
          isCloseCase: true, //pendiente validar,
          showMemorandumCheck: true,
          positiveBalance: this.guarantee.positiveBalance
        }
      });
      dialogDetail.afterClosed().subscribe(resp => {
        if (resp) {
          if (resp == true) {
            resp = { resp: true, ods: this.guarantee.odsOfCase };
          }
          this.guarantee.odsResponses.find(x => x.idOds === resp.ods?.idOds).state = resp.ods?.state;
          this.listODS = new MatTableDataSource(this.guarantee.odsResponses);
          if (this.guarantee.caseMemorandumMethod === 'ValidateInventory') {
            this.guarantee.nextMethod = 'ValidateInventory';
            this.crmUtilService.SaveStep(this.guarantee);
            this.ValidateInventory()
          }
          else {
            this.guarantee.nextMethod = 'IsMovilEquipmentRule';
            this.crmUtilService.SaveStep(this.guarantee);
            this.IsMovilEquipmentRule()
          }
        }
      });
    })
  }

  private ValidatePositiveBalance() {
    this.guarantee.boolSourceOriginCurrentOperation ? this.ValidatePositiveBalanceCurrentOperation() : this.ValidatePositiveBalanceInspira();
  }
  private ValidatePositiveBalanceCurrentOperation(): void {
    if (this.guarantee.financedProduct) {
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'WsPostSaleInsp -GetInvoices', dataTraza: this.guarantee.customerId });
      this.imeiTools.postGetInvoice(this.guarantee.customerId).subscribe(respInv => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'WsPostSaleInsp -GetInvoices', valueTraza: respInv });
        if (respInv.isValid) {
          const invoicesBSCS: ResponseInvoice = JSON.parse(respInv.message);
          const balance = invoicesBSCS.SaldoAFavor;
          balance !== undefined && balance >= 0 ? this.guarantee.positiveBalance = false : this.guarantee.positiveBalance = true;
          this.AfterValidatePaymentReferences();
        } else {
          this.util.OpenAlert('Error en servicio para consultar saldo a favor: ' + respInv.message, false);
        }
      }, (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'WsPostSaleInsp -GetInvoices', valueTraza: error });
        this.custom.SetMessageError = 'Error en servicio para consultar saldo a Favor ';

      });
    }
  }
  private ValidatePositiveBalanceInspira(): void {
    if (this.guarantee.financedProduct) {//se cambia if this.guarantee.odsMethod === 'ValidateFinancing'
      // Consultar saldo a favor en crédito del cliente.
      // Consultar valor pagado de contado. Pendiente
      // Solicitar creación de carrito. Pendiente - micrositio carrito
      // Solicitar elimnación del equipo. Pendiente  - micrositio carrito
      // Solicitar eliminación de campañas activas. Pendiente - micrositio carrito
      // Solicitar generación de la orden. Pendiente - micrositio carrito
      let wsPaymentReferences = this.parameters.URLSERVICIOSG.WsPaymentReferences;
      let dataTransform = {
        arrayData: [
          //header
          { name: 'startDate', value: this.util.ActualDate() },
          //body
          { name: 'paymentReference', value: this.paymentReference }
          // { name: 'paymentReference', value: '93000000248912' } // valor de pruebas que si trae saldo a favor
        ]
      } as DataTransform;
      this.ValidatePaymentReferenceService(wsPaymentReferences.Url, wsPaymentReferences.Xml, dataTransform);
    } else if (!this.guarantee.financedProduct) {
      const requestSapInventory: SapInventoryRequest = { headerRequest: HEADER_REQUEST, imei: this.getImeiConsultTransaction }
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateLoanedEquipmentTimes - PutSapInventoryInfo', dataTraza: requestSapInventory });
      this.externaslService.PutSapInventoryInfo(requestSapInventory).subscribe(responseSAP => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ValidateLoanedEquipmentTimes - PutSapInventoryInfo', valueTraza: responseSAP });
        //INICIO Parámetro prueba. Solo para prueba de escenarios sin saldo. Eliminar cuando se prueben todos los escenarios por QA o ya no sea requerido.
        if (this.parameters.TESTSINSALDO?.find(x => x === Number(this.guarantee.documentNumber))) {
          responseSAP.amount = '0';// linea test para escenarios sin saldo a favor
        }
        //FIN Parametro prueba
        responseSAP.amount !== undefined && responseSAP.amount !== '0' ? this.guarantee.positiveBalance = true : this.guarantee.positiveBalance = false;
        this.AfterValidatePaymentReferences();// se reusa metodo
      });
    }
  }

  get paymentReference(): string {
    if (this.guarantee.financingInfo
      && this.guarantee.financingInfo[0]
      && this.guarantee.financingInfo[0].chargeBillingAccount[0]) return this.guarantee.financingInfo[0]?.chargeBillingAccount[0]?._
    else return this.guarantee.account
  }
  private get getImeiConsultTransaction(): string {
    if (this.guarantee.hasEquipmentOnLoan && this.guarantee.odsOfCase.equipmentOnLoan?.imei) return this.guarantee.odsOfCase.equipmentOnLoan.imei
    else {
      if (this.guarantee.odsOfCase.imei !== undefined && this.guarantee.odsOfCase.imei !== null && this.guarantee.odsOfCase.imei !== '') return this.guarantee.odsOfCase.imei
      else return this.guarantee.odsOfCase.serial;
    }
  }

  private ValidatePaymentReferenceService(urlString: string, xmlString: string, data: DataTransform): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentReferencesMgmt - getPaymentReferences', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        this.wsSoapService.wsSoap(urlString, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentReferencesMgmt - getPaymentReferences', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus[0]["status"][0]).toUpperCase() === "OK") {
                    this.wsSoapService.getObjectByElement(jsonResponse, 'currentBalance').then(
                      (currentBalance) => {
                        if (currentBalance.length > 0) {
                          const result = Number(currentBalance[0]);
                          if (result !== undefined && result < 0) {
                            this.guarantee.positiveBalance = true;
                            this.AfterValidatePaymentReferences();
                          } else {
                            this.guarantee.positiveBalance = false;
                            this.AfterValidatePaymentReferences();
                          }
                        } else {
                          this.guarantee.positiveBalance = false;
                          this.AfterValidatePaymentReferences();
                        }
                      }, (error) => {
                        this.guarantee.positiveBalance = false;
                        this.AfterValidatePaymentReferences();
                      }
                    );
                  } else {
                    this.guarantee.positiveBalance = false;
                    this.AfterValidatePaymentReferences();
                  }
                }
              )
            } catch (error) {
              this.guarantee.positiveBalance = false;
              this.AfterValidatePaymentReferences();
            }
          },
          (error) => {
            //Se valida si el error del ws es por data no encontrada o por un error real en el servidor
            if (this.parameters.WARRANTY_VALUES.AdmittedErrors500.find(x => error?.error?.includes(x))) {
              this.guarantee.positiveBalance = false;
              this.AfterValidatePaymentReferences();
            } else {
              this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentReferencesMgmt - getPaymentReferences', valueTraza: error, error: true });
            }
          }
        )
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentReferencesMgmt - getPaymentReferences', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio para obtención de financiación: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);
      }
    );
  }
  // private AfterValidatePaymentReferences(): void{
  //   this.guarantee.consultODS = false;
  //   // this.guarantee.positiveBalance = true //QUEMADO
  //   if (this.guarantee.positiveBalance) {
  //     // al tener saldo positivo hace implementacion de carrito de compras
  //     // this.shoppingCartService.guarantee = this.guarantee
  //     // this.shoppingCartService.createShoppingCart().then(shoppingCart =>{
  //     //   shoppingCart.subscribe(res =>{

  //     //   })
  //     // })
  //     this.guarantee.odsMethod ='AfterValidatePaymentReferences'
  //     this.guarantee.nextMethod = 'CloseCase'
  //     this.crmUtilService.SaveStep(this.guarantee)
  //     const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.redirectMoneyRefound);
  //     dialogMsg.afterClosed().subscribe(resp=> {
  //       if (resp) {
  //       this.sendMessage('Refund');
  //       this.CloseCase()
  //       }
  //     })
  //     this.disabledQuery = true;
  //   } else {
  //     this.guarantee.positiveBalance = false;
  //     const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.NotFavorBalance);//acae
  //     dialogRef.afterClosed().subscribe(resp => {
  //       if (resp) {
  //       this.guarantee.isCloseCase = true;
  //       this.guarantee.nextMethod = 'UpdateCaseManual';
  //       this.guarantee.odsMethod = 'AfterValidatePaymentReferences';
  //       this.crmUtilService.SaveStep(this.guarantee);
  //       this.UpdateCaseManual();
  //       }
  //     });
  //   }
  // }

  private AfterValidatePaymentReferences(): void {
    this.guarantee.consultODS = false;
    // this.guarantee.positiveBalance = true //QUEMADO
    if (this.guarantee.positiveBalance) {
      // al tener saldo positivo hace implementacion de carrito de compras
      this.showShoppingCart(true,null);
    } else {
      this.showShoppingCart(false,null);
    }
  }


  private SendEmailODS() {
    if (!this.dialog.getDialogById('errorModal')) { //Si no hay abierto modal de error
      sessionStorage.setItem('idOds', this.guarantee.selectedCase.idOds);
      const dialogEmail = this.dialog.open(SendemailComponent, {
        disableClose: true,
        data: this.guarantee.odsBase64 || 'no recibido'
      });
      dialogEmail.afterClosed().subscribe(resp => {
        if (resp) {
          this.guarantee.odsMethod === 'ValidateFinancing' ? this.guarantee.nextMethod = 'ValidatePositiveBalance' : this.guarantee.nextMethod = 'ClientReceiveEquipment';
          this.crmUtilService.SaveStep(this.guarantee);
          this.guarantee.odsMethod === 'ValidateFinancing' ? this.ValidatePositiveBalance() : this.ClientReceiveEquipment();
        }
      });
    }
  }

  // Método para mostrar regla para preguntar si cliente recibe el equipo
  private ClientReceiveEquipment(): void {
    const dialogRef = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'RecibeEquipo',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (resp.value === 'NO' && resp.ruleName === 'RecibeEquipo') {
          //Simulación #6
          // Actualizar caso con estado/novedad 'cliente no recibe equipo' por inconformidad. Pendiente. Mostrar alerta en caso de exito
          const dialogRef = this.dialog.open(InformativeModalComponent, {
            disableClose: true,
            data: this.parameters.WARRANTY_MESSAGES.NotReceiveEquipment,
            id: 'success-alert',
          });
          dialogRef.afterClosed().subscribe(resp => {
            if (resp) {
              // Actualizar caso con estado 'asignado', Check de prioridad activo. Pendiente. Mostrar alerta en caso de exito
              const dialogRef2 = this.dialog.open(InformativeModalComponent, {
                disableClose: true,
                data: this.parameters.WARRANTY_MESSAGES.AssignedCase,
                id: 'success-alert',
              });
              dialogRef2.afterClosed().subscribe(resp => {
                if (resp) {
                  // Flujo 47. Pendiente
                  this.guarantee.nextMethod = 'CloseCase';
                  this.crmUtilService.SaveStep(this.guarantee);
                  this.CloseCase();
                }
              });
            }
          });
          //Fin Simulación #6
          //Cliente si recibe equiupo se notifica finalizar atencion
        } else if (resp.ruleName === 'CambioEquipo' || resp.ruleName === 'RecibeEquipo') {
          this.guarantee.nextMethod = 'CloseCase';
          this.guarantee.odsMethod = 'ClientReceiveEquipment';
          this.crmUtilService.SaveStep(this.guarantee);
          this.guarantee.hasToPay ? this.sendMessage('PaymentReceived') : this.sendMessage('EquipmentReceived');;
          this.ValidateFinancing();
        }
      }
    });
  }

  //Método que que actualiza caso a cerrado e indica que finalice atención
  private CloseCase(): void {
    const dialogRef = this.dialog.open(DecisionTableModalComponent, {
      disableClose: true,
      data: 'ConformeSolucion',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (String(resp.value).toUpperCase() === 'SI') {
          let successMessage = this.parameters.WARRANTY_MESSAGES.EndAttention;
          if (this.sg['closedCase'] === 'true') {
            this.disabledQuery = true
            successMessage = this.parameters.WARRANTY_MESSAGES.InternalCaseClosed;
          }
          //Simulación #3. Adicionar consumo de actualización de caso y mostrar alerta solo si es exitoso
          this.dialog.closeAll();
          this.disabledQuery = true;
          this.util.OpenAlert(successMessage, true);
        } else {
          console.log('Entro a cierre negativo');
          this.dialog.closeAll();
          this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.EndAttentionPQR)
            .afterClosed().subscribe(() => this.disabledQuery = true);
        }
      }
    })

    //Fin Simulación #3
  }

  //Metódo que indica que se debe finalizar atención
  private EndAttention(): void {
    this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.EndAttention, true);
  }

  public getTypeDocument(idTypeDoc: any): string {
    let typeDocStr: string = '';
    try {
      typeDocStr = this.documentTypes.find(doc => doc.Id === idTypeDoc).Description;
    } catch (error) {
      typeDocStr = '-';
    }
    return typeDocStr;
  }

  public getIdTypeDocument(typeDoc: string): number | null {
    let idTypeDoc = null
    try {
      idTypeDoc = Number(this.documentTypes.find(doc => doc.Code === typeDoc).Id);
    } catch (err) {
      idTypeDoc = null;
    }
    return idTypeDoc;
  }


  public getCaseState(stateeCase: any): string {
    let caseStateStr: string = '';
    try {
      caseStateStr = this.listCaseStates.find(state => state.id === stateeCase).description;
    } catch (error) {
      caseStateStr = '-'
    }
    return caseStateStr;
  }

  public getCaseTyping(typeCase: any): string {
    let typeCaseStr: string = '';
    try {
      typeCaseStr = this.typingCases.find(type => type.id === typeCase).description;
    } catch (error) {
      typeCaseStr = '-';
    }
    return typeCaseStr;
  }

  public getTSC(idTSC: any): string {
    let strTSC: string = '';
    try {
      strTSC = this.listCst.find(center => center.id === idTSC).description;
    } catch (error) {
      strTSC = '-';
    }
    return strTSC;
  }

  private getCurrentLists() {
    if (this.listWarranty !== undefined && this.listWarranty.length > 0) {
      this.listCaseStates = [{ id: 0, description: "Seleccione...", name: "", value: false, disable: false }, ...this.listWarranty.find(item => item.nameList === 'INTERNAL_CASE_STATE').value]
      this.listCst = this.listWarranty.find(item => item.nameList === 'TSC').value;
      this.typingCases = this.listWarranty.find(item => item.nameList === 'TYPING').value;
    } else {
      this.warrantyService.GetLists().then(resp => {
        if (resp || this.custom.GetCountError() <= environment.ic) {
          this.listWarranty = this.warrantyService.GetListWarranty();
          this.getCurrentLists();
        }
      });
    }
  }

  public sendMessage(messageType: Message_Type) {
    let message = this.parameters.WARRANTY_MESSAGES[messageType];
    // Si el servicio de consultaCIM no responde correctamente entonces envia  la información al cliente al correo electrónico y celular registrados en la ODS
    let dataPhone = this.guarantee.phoneNumber === '' ? '57' + this.guarantee.odsResponses[0].client.phone : this.guarantee.phoneNumber;
    let dataEmail = this.guarantee.email === '' ? this.guarantee.odsResponses[0].client.email : this.guarantee.email;

    if (this.guarantee.notificationPreference === 'MIN') {
      console.log('SMS');
      this.crmUtilService.BodyNotification(dataPhone, dataEmail, message, 'sms');
    } else {
      console.log('EMAIL');
      this.crmUtilService.BodyNotification(dataPhone, dataEmail, message, 'email');
    }
  }
  private objODSBase64(Base64) {
    if (Base64 !== undefined) {
      this.guarantee.odsBase64 = Base64;
    }
  }
  public GetGuaranteeDocument(newGuarantee: Guarantee): void {
    if (newGuarantee !== undefined) {
      this.guarantee = newGuarantee;
      this.LoadedFiles();
    }
  }
  private LoadedFiles(): void {
    this.guarantee.nextMethod = this.guarantee.odsMethod === 'ValidateFinancing' ? 'ValidatePositiveBalance' : 'ClientReceiveEquipment';
    this.crmUtilService.SaveStep(this.guarantee);
    const dialogRef = this.dialog.open(InformativeModalComponent, {
      disableClose: true,
      data: this.parameters.WARRANTY_MESSAGES.DocumentsUploaded,
      id: 'success-alert',
    });
    dialogRef.afterClosed().subscribe(resp => {
      if (resp) {
        if (this.guarantee.odsMethod === 'ValidateFinancing') {
          this.ValidatePositiveBalance();
        } else {
          if (this.guarantee.odsMethod === 'ValidateSapInventoryImei') {
            this.ValidateSapInventoryImei();
          } else {
            this.ClientReceiveEquipment();
          }
        }
      }
    });
  }
  private CloseTransaction(): void {
    if (this.guarantee.guid !== undefined) {
      let requestCloseTransaction: RequestCloseTransaction = {
        guidTransaction: this.guarantee.guid,
        state: 'finalizar'
      }
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CrmUtils - closeTransaction', dataTraza: requestCloseTransaction });
      this.crmUtilService.CloseTransaction(requestCloseTransaction).subscribe(data => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CrmUtils - closeTransaction', valueTraza: data });
        let returnSite: string = decodeURIComponent(this.guarantee.URLReturn);
        top.location.href = returnSite;
      });
    } else {
      let returnSite: string = decodeURIComponent(this.guarantee.URLReturn);
      top.location.href = returnSite;
    }
  }

  // FinalizarAtencionDevMode() {
  //   const numberDocument = this.internalCaseForm.get('documentNumber').value
  //   const typeDocument = this.internalCaseForm.get('documentType').value
  //   this.crmUtilService.CreateTransaction({numberDocument, typeDocument, idTurn:'0', idFlow:'958'})
  //     .pipe(switchMap((transac:any) => this.crmUtilService.CloseTransaction({guidTransaction: transac.Guid, state: 'finalizar'})))
  //     .subscribe(() => {
  //       this.crmUtilService.CreateTransaction({numberDocument, typeDocument, idTurn:'0', idFlow:'959'})
  //       .pipe(switchMap((transac) => this.crmUtilService.CloseTransaction({guidTransaction: transac.Guid, state: 'finalizar'})))
  //       .subscribe(()=> this.util.OpenAlert('Atención Finalizada en modo Desarrollo', true))
  //     })
  // }

  private setEmailBody() {
    const currentDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();

    const body = {} as RequestNotificationSMTP;
    let header = {} as HeaderSMTP;
    const rootObj = {} as RootObjectSMTP;
    const messageOne = {} as MessageBox;
    const messageTwo = {} as MessageBox2;
    const attach = {} as Attach;
    header = this.parameters.NOTIFICATIONVALUES.HeaderSMTP;
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
    rootObj.subject = this.parameters.NOTIFICATIONVALUES.subject;
    //rootObj.subject = this.emailSubject;

    messageOne.messageChannel = this.parameters.NOTIFICATIONVALUES.messageChannel;
    messageOne.messageBox = [messageTwo];

    // attach.name = this.parameters.NOTIFICATIONVALUES.attachName;
    attach.name = sessionStorage.getItem('idOds') + '.pdf';
    attach.type = this.parameters.NOTIFICATIONVALUES.attachType;

    //attach.content = this.urlFileDocument;
    attach.content = '';

    messageTwo.customerId = this.parameters.NOTIFICATIONVALUES.customerId;
    //messageTwo.customerBox = this.email;
    messageTwo.customerBox = '';

    body.headerRequest = header;
    body.message = JSON.stringify(rootObj);

    return body;
  }

  private ValidateSapInventoryImei(): void {
    const requestSapInventory: SapInventoryRequest = { headerRequest: HEADER_REQUEST, imei: this.getImeiConsultTransaction }
    this.externaslService.PutSapInventoryByImei(requestSapInventory).subscribe(response => {
      if (response.clienteNumber1.startsWith("D")) {
        const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ExternalInventoryClassification);
        dialogMsg.afterClosed().subscribe(() => {
          const dialogRef = this.dialog.open(DecisionTableModalComponent, {
            disableClose: true,
            data: 'ProductoServicioAsociado',
          });
          dialogRef.afterClosed().subscribe(resp => {
            if (resp.value.toUpperCase() === 'SI') {
              const dialogMsg = this.util.getMessageModal('PBI_CONSUMO SERVICIOS VALIDACIÓN SUSPENSIÓN DEL SERVICIO - FLUJO 48 CR 190_sprint34');
            } else {
              this.externaslService.putSendNotificationEmail(this.setEmailBody())
                .subscribe((resp: any) => {
                  if (Boolean(resp.isValid)) {
                    const dialogInfo = this.dialog.open(InformativeModalComponent, {
                      disableClose: true,
                      data: 'Envío Exitoso',
                      id: 'success-alert',
                    });
                    dialogInfo.afterClosed().subscribe(d => {
                      if (d) {
                        this.CloseCase();
                      }
                    });
                  } else {
                    this.util.OpenAlert('Envío Fallido', false);
                    this.CloseCase();
                  }
                });
            }
          });
        });
      } else {
        const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.OwnInventoryClassification);
        dialogMsg.afterClosed().subscribe(() => {
          const dialogRef = this.dialog.open(DecisionTableModalComponent, {
            disableClose: true,
            data: 'ProductoServicioAsociado',
          });
          dialogRef.afterClosed().subscribe(resp => {
            if (resp.value.toUpperCase() === 'SI') {
              const dialogMsg = this.util.getMessageModal('PBI_CONSUMO SERVICIOS VALIDACIÓN SUSPENSIÓN DEL SERVICIO - FLUJO 48 CR 190_sprint34');
            } else {
              this.externaslService.putSendNotificationEmail(this.setEmailBody())
                .subscribe((resp: any) => {
                  if (Boolean(resp.isValid)) {
                    const dialogInfo = this.dialog.open(InformativeModalComponent, {
                      disableClose: true,
                      data: 'Envío Exitoso',
                      id: 'success-alert',
                    });
                    dialogInfo.afterClosed().subscribe(d => {
                      if (d) {
                        this.CloseCase();
                      }
                    });
                  } else {
                    this.util.OpenAlert('Envío Fallido', false);
                    this.CloseCase();
                  }
                });
            }
          });
        });
      }
    }, (error) => {
      this.util.OpenAlert('Error en el servicio Inventory SAP ' + error.message, false);
    });
  }

  public showShoppingCart(positiveBalance: boolean,flag? :string) {
    let requestShoppingCart = undefined;
    if (this.guarantee.selectedCase.state == 8) { //cambio de equipo
      this.externaslService.GetContextAttribute(this.requestContextAttribute).subscribe(respAttributteContext => {
        if (!respAttributteContext.ok) {
          this.util.OpenAlert('Error al consultar atributos de contexto ' + respAttributteContext.messagge, false);
        } else {
          requestShoppingCart = this.requestEquipmentChangeSC(respAttributteContext.body[0].subscriptions[0].contextAttributes);
          if(flag == null){
            this.ShowShoppingCartModal(requestShoppingCart, positiveBalance);
          }else{
            this.ShowShoppingCartModalComponent(requestShoppingCart, positiveBalance);
          }
        }
      }, (error) => {
        this.util.OpenAlert('Error al consultar atributos de contexto ' + error, false)
      });
    } else {
      requestShoppingCart = this.requestEquipmentLoanSC;
      if(flag == null){
        this.ShowShoppingCartModal(requestShoppingCart, positiveBalance);
      }else{
        this.ShowShoppingCartModalComponent(requestShoppingCart, positiveBalance);
      }
    }
  }

  ValidateShoppingCartItems(scID: string, items: ItemSC[], positiveBalance: boolean) {
    if (items === undefined || items.length === 0) {
      this.util.OpenAlert(this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.NotAssociatedInformation, 'Items de carrito de compras '), false)
    } else {
      const dialogRef = this.dialog.open(ShoppingcartitemclsComponent, {
        disableClose: true,
        data: {
          scID: scID,
          items: items
        },
        minWidth: '70%'
      });
      dialogRef.afterClosed().subscribe(item => {
        const requestSapInventory: SapInventoryRequest = { headerRequest: HEADER_REQUEST, imei: this.getImeiConsultTransaction }
        this.externaslService.PutSapInventoryByImei(requestSapInventory).subscribe(response => {
          if (response.clienteNumber1.startsWith("D")) {
            const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.ExternalInventoryClassification);
            dialogMsg.afterClosed().subscribe(() => {
              this.InventoryCreateOrder(response.businessDocumentNumber, response.position, response.position, this.getImeiConsultTransaction);
              // if (this.guarantee.positiveBalance) {
              //   this.guarantee.odsMethod = 'AfterValidatePaymentReferences'
              //   this.guarantee.nextMethod = 'CloseCase'
              //   this.crmUtilService.SaveStep(this.guarantee)
              //   const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.redirectMoneyRefound);
              //   dialogMsg.afterClosed().subscribe(resp => {
              //     if (resp) {
              //       this.sendMessage('Refund');
              //       this.CloseCase()
              //     }
              //   })
              //   this.disabledQuery = true;
              // } else {
              //   this.guarantee.positiveBalance = false;
              //   const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.NotFavorBalance);//acae
              //   dialogRef.afterClosed().subscribe(resp => {
              //     if (resp) {
              //       this.guarantee.isCloseCase = true;
              //       this.guarantee.nextMethod = 'UpdateCaseManual';
              //       this.guarantee.odsMethod = 'AfterValidatePaymentReferences';
              //       this.crmUtilService.SaveStep(this.guarantee);
              //       this.UpdateCaseManual();
              //     }
              //   });
              // }
            });
          } else {
            const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.OwnInventoryClassification);
            dialogMsg.afterClosed().subscribe(() => {
              if (this.guarantee.positiveBalance) {

                this.guarantee.odsMethod = 'AfterValidatePaymentReferences'
                this.guarantee.nextMethod = 'CloseCase'
                this.crmUtilService.SaveStep(this.guarantee)
                const dialogMsg = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.redirectMoneyRefound);
                dialogMsg.afterClosed().subscribe(resp => {
                  if (resp) {
                    this.sendMessage('Refund');
                    this.CloseCase()
                  }
                })
                this.disabledQuery = true;
              } else {
                this.guarantee.positiveBalance = false;
                const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.NotFavorBalance);//acae
                dialogRef.afterClosed().subscribe(resp => {
                  if (resp) {
                    this.guarantee.isCloseCase = true;
                    this.guarantee.nextMethod = 'UpdateCaseManual';
                    this.guarantee.odsMethod = 'AfterValidatePaymentReferences';
                    this.crmUtilService.SaveStep(this.guarantee);
                    this.UpdateCaseManual();
                  }
                });
              }
            });
          }
        }, (error) => {
          this.util.OpenAlert('Error en el servicio Inventory SAP ' + error.message, false);
        });
      });
    }
  }

  ShowShoppingCartModal(requestShoppingCart: any, positiveBalance: boolean) {
    this.externaslService.PostSalesEntryPoint(requestShoppingCart)
      .subscribe(entryPoint => {
        const externalDialog = this.dialog.open(ModalMicrositesComponent, {
          width: '100%',
          height: '100%',
          disableClose: true,
          data: { urlSite: entryPoint.url, guarantee: this.guarantee }
        })
        externalDialog.afterClosed().subscribe(resp => {
          this.externaslService.GetSalesSCByToken(entryPoint.idSesion).subscribe(respSC => {
            const responseSCT: ResponseSCToken = respSC;
            if (!responseSCT.ok) {
              this.util.OpenAlert('Error al obtener carrito' + responseSCT.messagge, false);
            } else {
              this.ValidateShoppingCartItems(responseSCT.body.scID, responseSCT.body?.items, positiveBalance)
            }
          });
        });
      }, (error) => {
        this.util.OpenAlert('Error al consultar carrito de compras' + error, false)
      });
  }

  private get requestContextAttribute() {
    return {
      documentType: this.guarantee.documentType,
      id: this.guarantee.documentNumber,
      account: this.guarantee.account
    }
  }

  private get requestEquipmentLoanSC() {
    return {
      documentType: this.guarantee.documentType,
      documentNumber: this.guarantee.documentNumber,
      account: this.guarantee.account,
      idUser: this.guarantee.idUser,
      idHeader: this.guarantee.biHeaderId,
      idTurn: this.guarantee.idTurn,
      source: this.guarantee.source,
      flowType: 'flujo',
      flowName: 'equipos-tecnologias/prestamo-equipo',
      imei: this.guarantee.odsResponses[0].equipment.imei,  
      min: this.guarantee.min,
      redirect: false
    }
  }

  private requestEquipmentChangeSC(contextAttributes: ContextAttribute[]): any {
    if (contextAttributes === undefined || contextAttributes.length === 0) {
      this.util.OpenAlert('Error contextAttributes undefined', false);
    }

    return {
      source: this.guarantee.source,
      account: this.guarantee.account,
      idUser: this.guarantee.idUser,
      idHeader: this.guarantee.biHeaderId,
      flowType: "flujo",
      flowName: "cambio-equipo-por-garantia",
      urlReturn: "",
      imei: this.guarantee.odsResponses[0].equipment.imei,
      min: this.guarantee.min,
      addressId: this.guarantee.idAddress,
      redirect: false,
      contextAttributes: contextAttributes
    }
  }

  // Método para consultar servicios de envioMessageModificacion
  private ConsumeWsSendMessageModification(url: string, xmlString: string, data: DataTransform): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeWsSendMessageModification - envioMessageModificacion', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        this.wsSoapService.wsSoap(url, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeWsSendMessageModification - envioMessageModificacion', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'ns2:envioMensajeResponse').then(
                (responseStatus) => {
                  console.log('jsonResponse', jsonResponse);
                  if (responseStatus.length > 0) {
                    const dialogRef = this.util.getMessageModal(this.parameters.WARRANTY_MESSAGES.SendMessageModification)
                    dialogRef.afterClosed().subscribe(resp => {
                      if (resp) {
                        //pendiente ajustar el llamado a carrito de compras por definicion en reunion
                        this.guarantee.nextMethod = 'ODCGenerated';
                        this.pdfFormat.GetODSFormat(this.guarantee.selectedCase.idOds);
                      }
                    });
                  } else {
                    this.util.OpenAlert('Error al consultar servicio envioMessageModificacion: ' +
                      this.parameters.WARRANTY_MESSAGES.Refresh, false);
                  }
                }
              );
            } catch (error) {
              this.util.OpenAlert('Error al consultar servicio envioMessageModificacion: ' + error + '. ' +
                this.parameters.WARRANTY_MESSAGES.Refresh, false);
            }
          }, (error) => {
            this.custom.SetMessageError = 'Error al consultar servicio envioMessageModificacion: ';
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeWsSendMessageModification - envioMessageModificacion', valueTraza: error, error: true });
          }
        );
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeWsSendMessageModification - envioMessageModificacion', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio envioMessageModificacion: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);
      }
    );
  }
 
  ShowShoppingCartModalComponent(requestShoppingCart: any, positiveBalance: boolean) {
    this.externaslService.PostSalesEntryPoint(requestShoppingCart)
      .subscribe(entryPoint => {
        const externalDialog = this.dialog.open(ModalMicrositesComponent, {
          width: '100%',
          height: '100%',
          disableClose: true,
          data: { urlSite: entryPoint.url, guarantee: this.guarantee }
        })
        externalDialog.afterClosed().subscribe(resp => {
          this.guarantee.isCloseCase = true;
          this.sendMessage('Refund');
          this.CloseCase();
        });
      }, (error) => {
        this.util.OpenAlert('Error al consultar carrito de compras' + error, false)
      });
  }  
}
