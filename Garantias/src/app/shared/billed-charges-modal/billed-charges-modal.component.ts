import { Component, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Parameter } from 'src/app/models/parameter';
import { CustomService } from 'src/app/services/custom.service';
import { DataTransform, WsSoapService } from 'ws-soap-lib';
import { TraceabilityOtp } from 'src/app/services/traceabilityOtp.service';
import { RequestTraceabilityOtp } from 'src/app/models/traceabilityOtp';
import { Util } from '../util';
import { Adjustment } from 'src/app/models/adjustment';
import { Guarantee } from 'src/app/models/guarantee';

@Component({
  selector: 'app-billed-charges-modal',
  templateUrl: './billed-charges-modal.component.html',
  styleUrls: ['./billed-charges-modal.component.scss']
})
export class BilledChargesModalComponent {

  private util = new Util(this.dialog);
  private traceability = { error: false } as RequestTraceabilityOtp;
  private parameters: Parameter

  public pendingInvoiceYes: boolean = false;
  public pendingInvoiceNot: boolean = false;

  public occDeleted: string;
  public adjustmentDone: string;
  public AdjustmentSuccessful: string;
  public creditCancellation: string;

  public typeAdjustmentSelect = [];
  public typeRemark: string = '';
  public valueAdjust: string = '';

  public typeRemark2: string = '';
  public valueAdjust2: string = '';

  public anularView: boolean = false;
  public checkPaymentsView: boolean = false;
  public adjustFinalView: boolean = false;

  public adjustFinalBtn: boolean = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: Guarantee,
  private custom: CustomService,
  private traceabilityWs: TraceabilityOtp,
  private wsSoapService: WsSoapService,
  private dialog: MatDialog) { 
    console.log('data modal',data);
    this.parameters = this.custom.GetParametersGroup();    
  }

  ngOnInit(): void {
    // Variable que determina si cobro esta pendiente por facturar
    let fact = false;
    
    fact ? this.pendingInvoiceYes = true : this.pendingInvoiceNot = true; 
    this.occDeleted = this.parameters.WARRANTY_MESSAGES.OccDeleted;
    this.adjustmentDone = this.parameters.WARRANTY_MESSAGES.AdjustmentDone;
    this.AdjustmentSuccessful = this.parameters.WARRANTY_MESSAGES.AdjustmentSuccessful;
    this.creditCancellation = this.parameters.WARRANTY_MESSAGES.CreditCancellationError;

    this.SetRequestWsGetTypeAdjustmentsManagement();
  }

  private SetRequestWsGetTypeAdjustmentsManagement(): void {
    const wsGetTypeAdjustmentsM = this.parameters.URLSERVICIOSG.WsGetTypeAdjustmentsManagement;
    let dataTransform = {
      arrayData: [
        // Header
        { name: 'idApplication', value: this.data.idFlow},
        { name: 'startDate', value: this.util.ActualDate() },
        { name: 'userApplication', value: this.data.idUser },
      ]
    } as DataTransform;
    this.ConsumeWsGetTypeAdjustmentsManagement(wsGetTypeAdjustmentsM.Url, wsGetTypeAdjustmentsM.Xml, dataTransform);
  }

  // Método para consultar servicios de GetTypeAdjustmentsManagement
  private ConsumeWsGetTypeAdjustmentsManagement(url: string, xmlString: string, data: DataTransform): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeGetAdjustmentsManagement - GetAdjustmentsManagement', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        this.wsSoapService.wsSoap(url, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeGetAdjustmentsManagement - GetAdjustmentsManagement', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'tns:responseStatus').then(
                (responseStatus) => {
                  console.log('jsonResponse',jsonResponse);
                  if (responseStatus.length > 0 && (responseStatus['0']['status']['0']).toLowerCase() === "ok") {
                    this.ValidateGetTypeAdjustmentsManagement(jsonResponse);
                  } else {
                    this.util.OpenAlert('Error al consultar servicio(GetTypeAdjustmentsManagement) para consulta de tipos de ajustes: ' + responseStatus['0']['message'] + '. ' +
                      this.parameters.WARRANTY_MESSAGES.Refresh, false);
                  }
                }
              );
            } catch (error) {
              this.util.OpenAlert('Error al consultar servicio(GetTypeAdjustmentsManagement) para consulta de tipos de ajustes: ' + error + '. ' +
                this.parameters.WARRANTY_MESSAGES.Refresh, false);
            }
          }, (error) => {
            this.custom.SetMessageError = 'Error en servicio para consulta de tipos de ajustes ';
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeGetAdjustmentsManagement - GetAdjustmentsManagement', valueTraza: error, error: true });
          }
        );
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeGetAdjustmentsManagement - GetAdjustmentsManagement', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio(GetTypeAdjustmentsManagement) para consulta de tipos de ajustes: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);
      }
    );
  }

  // Método para validar respuesta de servicio de GetTypeAdjustmentsManagement
  private ValidateGetTypeAdjustmentsManagement(jsonResponse: string): void {
    this.wsSoapService.getObjectByElement(jsonResponse, 'tns:adjustments').then(
      (response) => {
        if (response.length > 0) {
          let adjustmentList: Adjustment[];
          adjustmentList = JSON.parse(JSON.stringify(response).split('tns:').join(''));
          const list = adjustmentList[0].adjustment.sort((a, b) => 0 - (a.remark[0].toUpperCase() > b.remark[0].toUpperCase() ? -1 : 1));
      
          this.typeAdjustmentSelect.push(list[0].remark);
          console.log('GetTypeAdjustmentsManagement Service',this.typeAdjustmentSelect);
          // list.forEach(adj => {
          //   if (adj.remark[0] != undefined && adj.remark[0] != "NULL") {
          //     this.typeAdjustmentSelect.push({ remark: adj.remark[0] });
          //     // console.log('this.typeAdjustmentSelect',this.typeAdjustment);
          //   }
          // });
        } else {
          this.util.OpenAlert('Tipos de ajustes no encontrados (GetTypeAdjustmentsManagement). ' +
            this.parameters.WARRANTY_MESSAGES.EndAttention, false);
        }
      }, (error) => {
        this.util.OpenAlert('Error al consultar servicio(GetTypeAdjustmentsManagement) para consulta de tipos de ajuste: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.EndAttention, false);
      }
    );
  }

  // Método para preparar request de consumo para servicio de ChargesNotification
  public SetChargesNotificationAdjust(actionExecute: number): void {
    
    let amount;
    let remark;    

    if(actionExecute == 1){
      amount = this.valueAdjust;
      remark = this.typeRemark;
    }else{
      amount = this.valueAdjust2;
      remark = this.typeRemark2;
    }

    if(amount === '' || remark === ''){
      this.util.OpenAlert('Por favor complete todos los campos para realizar la consulta.', false);
    }else{
      const wsChargesNotificationAdj = this.parameters.URLSERVICIOSG.WsChargesNotificationAdjust;
      let dataTransform = {
        arrayData: [
          // Header
          { name: 'idApplication', value: this.data.idFlow },
          { name: 'startDate', value: this.util.ActualDate() },
          { name: 'userApplication', value: this.data.idUser},
          // Body
          { name: 'accountNumber', value: this.data.account },
          { name: 'amount', value: amount },
          { name: 'remark', value: remark }
        ]
      } as DataTransform;
      this.ConsumeChargesNotificationAdjust(wsChargesNotificationAdj.Url, wsChargesNotificationAdj.Xml, dataTransform, actionExecute);
    }
    
  }

  // Método para consultar servicios de ChargesNotification
  private ConsumeChargesNotificationAdjust(url: string, xmlString: string, data: DataTransform, actionExecute: number): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeChargesNotification - ChargesNotification', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        this.wsSoapService.wsSoap(url, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeChargesNotification - ChargesNotification', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then(
                (responseStatus) => {
                  console.log('ChargesNotificationAdjust Service',responseStatus['0']);
                  if (responseStatus.length > 0 && (responseStatus['0']['status']['0']).toLowerCase() === "ok") {
                    // this.dialogRef.close(true);
                    if(actionExecute == 1){
                      this.anularView = true;
                    }else{
                      this.adjustFinalView = true;
                    }
                  } else {
                    this.util.OpenAlert('Error al consultar servicio(ChargesNotification) para crear OCC: ' + responseStatus['0']['message'] + '. ' +
                      this.parameters.WARRANTY_MESSAGES.Refresh, false);
                  }
                }
              );
            } catch (error) {
              this.util.OpenAlert('Error al consultar servicio(ChargesNotification) para crear OCC: ' + error + '. ' +
                this.parameters.WARRANTY_MESSAGES.Refresh, false);
            }
          }, (error) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeChargesNotification - ChargesNotification', valueTraza: error, error: true });
          }
        );
      },
      (error) => {
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeChargesNotification - ChargesNotification', valueTraza: error, error: true });
        this.util.OpenAlert('Error al consultar servicio(ChargesNotification) para crear OCC: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);        
      }
    );
  }

  public delOccBtn(){
    this.anularView = true;
  }
  public requestDelCreditBtn(){
    this.checkPaymentsView = true;
    this.GetFinancingReasonStatus();
  }
  public checkPaysBtn(){
    this.checkPaymentsView = true;
    this.adjustFinalBtn = false;
  }

  //Traer reason id de cancelacion
  public GetFinancingReasonStatus():void{
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
      (xml) =>{
        this.wsSoapService.wsSoap(wsFinancigReason.Url, xml).then(
          (jsonResponse)=>{
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', valueTraza: jsonResponse });
            try{
              this.wsSoapService.getObjectByElement(jsonResponse,'responseStatus').then(
                (responseStatus) =>{
                  if (responseStatus.length > 0 && (responseStatus[0]["status"][0]).toUpperCase() === "OK") {
                    this.wsSoapService.getObjectByElement(jsonResponse,'reason').then(
                      (reasonId)=>{
                        if(reasonId.length>0){
                          const result = reasonId[0];
                          if(result !== undefined){
                            this.data.reasonId = String(result);
                            this.SetRequestCancellFinancig();
                          } else {
                            this.util.OpenAlert(messageError,false);
                          }
                        }else{
                          this.util.OpenAlert(messageError,false);
                        }
                      }, (error) =>{
                        this.util.OpenAlert(messageError,false);
                      }
                    )                                      ;
                  } else {
                    this.util.OpenAlert(messageError,false);
                  }
                }
              )
            } catch(error){
              this.util.OpenAlert(messageError,false);
            }
          },
          (error) => {
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

  private SetRequestCancellFinancig(): void{
    let wsCancellFinancing = this.parameters.URLSERVICIOSG.WsCancelFinancing;
    //wsCancellFinancing.Xml = this.util.StringFormat(wsCancellFinancing.Xml, this.data.financingInfo[0].chargeBillingAccount[0].$.id, this.guarantee.financingInfo[0]?.chargeBillingAccount[0]?._); Se cambia consumo CancelFinancing temporalmente hasta validar el consumo correcto del servicio.              
    wsCancellFinancing.Xml = this.util.StringFormat(wsCancellFinancing.Xml, this.data.financingInfo[0].accountNumber[0].$.id, sessionStorage.getItem('account'));

    let dataTransform = {
      arrayData: [
        //header
        { name: 'startDate', value: this.util.ActualDate() },
        //body
        { name: 'financingCode', value: this.data.financingInfo[0]?.financingCode[0] },
        { name: 'reasonId', value: this.data.reasonId },
        { name: 'validFrom', value: this.util.ActualDate() },
        { name: 'userName', value: this.data.idUser },
      ]
    } as DataTransform;
    this.CancelFinanciationService(wsCancellFinancing.Url, wsCancellFinancing.Xml, dataTransform);
  }

  //Metodo para consumir servicio de cancelacion de financiacion
  private CancelFinanciationService(urlString: string, xmlString: string, data: DataTransform): void{
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) =>{
        this.wsSoapService.wsSoap(urlString, xml).then(
          (jsonResponse)=>{
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'CancelFinancingManagement - CancelFinancing', valueTraza: jsonResponse });
            try{
              this.wsSoapService.getObjectByElement(jsonResponse,'responseStatus').then(
                (responseStatus) =>{
                  if (responseStatus.length > 0 && (responseStatus[0]["status"][0]).toUpperCase() === "OK") {
                    this.wsSoapService.getObjectByElement(jsonResponse,'resultDesc').then(
                      (resultDesc)=>{
                        if(resultDesc.length>0){
                          const result = resultDesc[0];
                          if(result !== undefined && result.includes('sin errores')){
                            this.creditCancellation = this.parameters.WARRANTY_MESSAGES.CreditCancellation;
                          } else {
                            this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente',false);
                          }
                        }else{
                          this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente',false);
                        }
                      }, (error) =>{
                        this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente',false);
                      }
                    )                                      ;
                  } else {
                    this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente',false);
                  }
                }
              )
            } catch(error){
              this.util.OpenAlert('No se ha verificado cancelación de cuenta, intentelo nuevamente',false);
            }
          },
          (error) => {
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
}
