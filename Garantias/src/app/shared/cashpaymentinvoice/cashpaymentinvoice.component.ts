import { GenericResponse } from './../../models/generic';
import { DataTransform, WsSoapService } from 'ws-soap-lib';
import { CustomService } from './../../services/custom.service';
import { TypeDocument } from './../../models/documentType';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CashPayInvoice, CashPaymentValidation } from 'src/app/models/invoice';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Parameter } from 'src/app/models/parameter';
import { Util } from '../util';
import { RequestTraceabilityOtp } from 'src/app/models/traceabilityOtp';
import { TraceabilityOtp } from 'src/app/services/traceabilityOtp.service';
import { InformativeModalComponent } from '../informative-modal/informative-modal.component';
import { Guarantee } from 'src/app/models/guarantee';
import { TypePayment } from 'src/app/models/ods';
import { CstVerifyPaymentRequest } from 'src/app/models/generic';
import { ImeiToolsService } from 'src/app/services/imeitools.service';
import { HEADER_REQUEST } from 'src/app/models/headerRequest';

@Component({
  selector: 'app-cashpaymentinvoice',
  templateUrl: './cashpaymentinvoice.component.html',
  styleUrls: ['./cashpaymentinvoice.component.scss']
})
export class CashpaymentinvoiceComponent implements OnInit {
  public titleModal: string;
  public valuePaymentString: string;
  public buttonString: string;
  public generatePayment: boolean;
  public cashInvoice: CashPayInvoice;
  public documentTypes: TypeDocument[];
  public cashPaymentValue: CashPaymentValidation;
  public cashInvoiceForm: FormGroup;
  private parameters: Parameter;
  private util = new Util(this.dialog);
  private traceability = { error: false } as RequestTraceabilityOtp;
  private guarantee = new Guarantee();


  constructor(@Inject(MAT_DIALOG_DATA) public data,
    private dialog: MatDialog,
             public dialogRef: MatDialogRef<CashpaymentinvoiceComponent>,
             private traceabilityWs: TraceabilityOtp,
             private wsSoapService: WsSoapService,
             private formBuilder: FormBuilder,
             private custom: CustomService,
             private imeiTools: ImeiToolsService

  ) {
    this.parameters = this.custom.GetParametersGroup();
    this.documentTypes = data.documentTypes;
    this.cashPaymentValue = data.cashValidation;
    this.guarantee = data.guarantee;
   }

  ngOnInit(): void {
    this.generatePayment = this.cashPaymentValue.generatePayment;
    this.titleModal = this.generatePayment === true ? 'Generar factura para pago en caja': 'Verificar pago de factura';
    this.valuePaymentString = this.generatePayment === true ? 'Valor a pagar': 'Valor cancelado';
    this.buttonString = this.generatePayment === true ? 'Generar factura': 'Verificar pago';
    this.cashInvoice = undefined;
    this.cashInvoice = this.cashPaymentValue.cashInvoice;
    let emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
    this.cashInvoice.email = sessionStorage.getItem('email') || this.cashInvoice.email
    this.cashInvoiceForm = this.formBuilder.group({
      reference: [{value: this.cashInvoice.reference, disabled: true}],
      documentType: [ {value:this.cashInvoice.documentType, disabled:true}],
      documentNumber: [{value: this.cashInvoice.documentNumber, disabled:true}],
      name: [{value: this.cashInvoice.name, disabled:true}],
      surname: [{value: this.cashInvoice.surname, disabled:true}],
      email: [{value: this.cashInvoice.email, disabled: !this.generatePayment}, [Validators.required, Validators.pattern(emailPattern)]],
      account: [{value: this.cashInvoice.account, disabled:true}],
      concept: [{value: this.cashInvoice.concept, disabled:true}],
      userId: [{value: this.cashInvoice.userId, disabled:true}],
      orderType: [{value: this.cashInvoice.orderType, disabled:true}],
      productId: [{value: this.cashInvoice.productId, disabled:true}],
      productName: [{value: this.cashInvoice.productName, disabled:true}],
      nameCav: [{value: this.cashInvoice.nameCav, disabled:true}],
      cityCav: [{value: this.cashInvoice.cityCav, disabled:true}],
      paymentValue: [{value: this.cashInvoice.paymentValue, disabled:true}],
    });
  }
  public submitCashInvoice(): void{
    sessionStorage.setItem('email', this.email.value)
    if(this.email.errors) return
    if(this.generatePayment){
      //si generatePayment es true va llamar micrositio
      //evalua el booleano y si es operacion actual el  booleano sera true si es op inspira sera false
      this.guarantee.boolSourceOriginCurrentOperation ? this.SetRequestInvoice():this.SetRequestInvoice();
    } else{
      // de lo contrario va a verificar el pago de la factura
        //evalua el booleano y si es operacion actual el  booleano sera true si es op inspira sera false
      this.guarantee.boolSourceOriginCurrentOperation ? this.ValidatePayment(): this.ValidatePayment();
    }

  }

  private SetRequestInvoice(): void{
    let   wsPaymentServiceOrder = undefined;
    wsPaymentServiceOrder = this.parameters.URLSERVICIOSG.WsPaymentServiceOrder;
    const xmlSrReplace = this.util.StringFormat(this.guarantee.strXmlPaymentService,String(this.cashInvoice.reference), this.cashInvoice.productId)
    wsPaymentServiceOrder.Xml = xmlSrReplace
    let dataTransform ={
      arrayData: [
        //header
        {name: 'requestDate', value: this.util.ActualDate()},
        // body
        {name: 'csIdentificationNumber', value: this.cashInvoice.documentNumber},
        {name: 'csIdentificationType', value: this.cashInvoice.shortDocType},
        {name: 'csFirstName', value: this.cashInvoice.name},
        {name: 'csLastName', value: this.cashInvoice.surname},
        {name: 'csMin', value: this.guarantee.min},
        {name: 'csAccount', value: this.cashInvoice.account},
        {name: 'productOffering', value: this.cashInvoice.productName},
        {name: 'totalAmount', value: this.cashInvoice.paymentValue},
        {name: 'csEmail', value: this.email.value}
    ]
    } as DataTransform;
    this.ConsumePaymentService(wsPaymentServiceOrder.Url, wsPaymentServiceOrder.Xml, dataTransform)
  }
  private ConsumePaymentService(url: string, xmlString: string, data: DataTransform): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentService - PaymentServiceOrder', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString,data).then(
      (xml)=>{
        this.wsSoapService.wsSoap(url,xml).then(
          (jsonResponse)=>{
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentService - PaymentServiceOrder', valueTraza: jsonResponse });
            try{
              this.wsSoapService.getObjectByElement(jsonResponse,'ns2:responseStatus').then(
                (responseStatus)=>{
                  if (responseStatus.length > 0 && (responseStatus[0]["ns2:status"][0]).toUpperCase() === "OK") {
                    this.wsSoapService.getObjectByElement(jsonResponse,'ns2:url').then(
                      (url)=>{
                        if(url.length>0){
                          this.CloseDialog(true,url[0]);
                        }else{
                          this.CloseDialog(false)
                        }
                      }, (error) =>{
                        this.CloseDialog(false);
                      }
                    );
                  } else {
                    this.CloseDialog(false);
                  }
                }
              )
            } catch(error){
              this.util.OpenAlert('Error al consultar servicio parageneración de Pago: ' + error + '. ' +
              this.parameters.WARRANTY_MESSAGES.EndAttention, false);
            }
          }, (error) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentService - PaymentServiceOrder', valueTraza: error, error: true });
            // this.util.OpenAlert('Error al consultar servicio parageneración de Pago: ' + error + '. ' +
            //   this.parameters.WARRANTY_MESSAGES.EndAttention, false);
            this.custom.SetMessageError = 'Error en servicio para consultar generación de pago';
          }
        );
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentService - PaymentServiceOrder', valueTraza: error, error: true });
        this.util.OpenAlert(this.util.StringFormat(this.parameters.WARRANTY_MESSAGES.ServiceNotAvailable, 'GetUrlDestination - generación pago: ' + error + '. ' ), false);
      }
    )
  }
  private ValidatePayment(): void{
    this.SetRequestVerifyPayment();
  }
  private SetRequestVerifyPayment(): void{
    const wsVerifyPayment = this.parameters.URLSERVICIOSG.WsVerifyPayment;
    let dataTransform = {
      arrayData:[
        //header
        {name: 'requestDate', value: this.util.ActualDate()},
        //body
        {name: 'paymentId', value:this.cashInvoice.reference}
      ]
    } as DataTransform;
    this.VerifyPaymentService(wsVerifyPayment.Url, wsVerifyPayment.Xml, dataTransform);
  }
  private VerifyPaymentService(urlString: string, xmlString: string, data: DataTransform): void{
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentService - VerifyPayment', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) =>{
        this.wsSoapService.wsSoap(urlString, xml).then(
          (jsonResponse)=>{
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentService - VerifyPayment', valueTraza: jsonResponse });
            try{
              this.wsSoapService.getObjectByElement(jsonResponse,'ns2:responseStatus').then(
                (responseStatus) =>{
                  if (responseStatus.length > 0 && (responseStatus[0]["ns2:status"][0]).toUpperCase() === "OK") {
                    this.wsSoapService.getObjectByElement(jsonResponse,'ns2:paymentStatus').then(
                      (paymentStatus)=>{
                        console.log('paymentStatus',paymentStatus);
                        if(paymentStatus.length>0){
                          let messageVerify = paymentStatus[0];
                          if(messageVerify=== this.parameters.STATESVERIFYCASH.EndPay){
                            this.CloseDialog(true,messageVerify);
                            this.GenerateNotificationPayment();
                          } else {
                            const verify = sessionStorage.getItem('paymentVerified')
                            if (verify){
                              let messageAlert = this.guarantee.typePayment === TypePayment.LoanPayment ? this.parameters.WARRANTY_MESSAGES.CashPaymentToInvoice : this.parameters.WARRANTY_MESSAGES.StoragePaymentNotVerified;
                              const dialogInfo = this.dialog.open(InformativeModalComponent, {
                                disableClose: true,
                                data: messageAlert ,
                                id: 'fail-alert',
                              });
                              dialogInfo.afterClosed().subscribe(res => {
                               if (res) {
                                sessionStorage.setItem('paymentVerified', 'false')
                                this.CloseDialog(false)
                               }
                              })
                            }else {
                              this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.CashPaymentNotVerify, false)
                              sessionStorage.setItem('paymentVerified', 'true')
                            }
                          }
                        }else{
                          this.CloseDialog(false)
                        }
                      }, (error) =>{
                        this.CloseDialog(false);
                      }
                    )                                      ;
                  } else {
                    this.CloseDialog(false);
                  }
                }
              )
            } catch(error){
              this.util.OpenAlert('Error al consultar servicio paara verificar pagos: ' + error + '. ', false);
            }
          },
          (error) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentService - VerifyPayment', valueTraza: error, error: true });
            // this.util.OpenAlert('Error al consultar servicio paara verificar pagos: ' + error + '. ', false);
            this.custom.SetMessageError = 'Error en servicio para verificar pagos';
          }
        )
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'PaymentService - VerifyPayment', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio paara verificar pagos: ' + error + '. ' , false);       
      }
    );
  }
  public CloseDialog(isValid: boolean, url?:any): void{
    let closeObj: GenericResponse = {
      isValid : isValid,
      message: url !== undefined ? url: ''
    }
    this.dialogRef.close(closeObj);
  }

  // Llamado del método NotificationPayment para envío de notificación
  private GenerateNotificationPayment(): void {
    let cstVerifyPaymentRq = new CstVerifyPaymentRequest();
      cstVerifyPaymentRq.headerRequest= HEADER_REQUEST;
      cstVerifyPaymentRq.codeODS = this.guarantee.odsOfCase.idOds;
      cstVerifyPaymentRq.invoiceNumber = String(this.guarantee.cashPaymentValidation.cashInvoice.reference);

      this.imeiTools.NotifyPaymentCST(cstVerifyPaymentRq,this.guarantee.selectedCase.tsc).subscribe(resp=>{
        console.log('GenerateNotificationPayment',resp);
        if (!resp.isValid) {
          this.util.OpenAlert('Error en el servicio de envío de notificación de pago.' , false); 
        }
      });
  }

  public get email(){
    return this.cashInvoiceForm.controls.email
  }

}
