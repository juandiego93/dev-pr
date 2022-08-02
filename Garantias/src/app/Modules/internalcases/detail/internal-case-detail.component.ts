import { HEADER_REQUEST } from 'src/app/models/headerRequest';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { UpdateCaseValues } from 'src/app/models/internalCase';
import { Util } from 'src/app/shared/util';
import { ExternalService } from 'src/app/services/external.service';
import { RequestTraceabilityOtp } from 'src/app/models/traceabilityOtp';
import { TraceabilityOtp } from 'src/app/services/traceabilityOtp.service';
import { ODSRequest, RepairState } from '../../../models/ods';
import { GetCaseResponse, WarrantyItem, InternalCaseResponse } from '../../../models/case';
import { SimpleGlobal } from 'ng2-simple-global';
import { Parameter } from 'src/app/models/parameter';
import { CustomService } from 'src/app/services/custom.service';
import { WarrantyOds,NewEquipment } from '../../../models/warranty-ods';
import { WarrantyService } from '../../../services/warranty.service';

@Component({
  selector: 'app-internal-case-detail',
  templateUrl: './internal-case-detail.component.html',
  styleUrls: ['./internal-case-detail.component.scss']
})
export class InternalCaseDetailComponent implements OnInit {
  private parameters: Parameter;
  public titleButton: string;
  public titleModal: string;
  public internalCaseValues = new UpdateCaseValues();
  public isOld: boolean;
  public pqrStatus: string[] = ["Finalizado", "Otro"];
  public pqrCloseCode: string[] = ["No favorable", "Devolución de dinero"];
  public stateInternalCase: WarrantyItem[]
  public scalationValues:boolean[] = [true, false]
  public odsRequest : WarrantyOds;
  private util = new Util(this.dialog);
  private traceability = { error: false } as RequestTraceabilityOtp;
  public showError = false;
  public listCases: Array<string> = []
  public showPaymentCheck = false
  public updateODS = true
  public disableUpdateInternalCase = false
  public consultODS: boolean;
  public dateUpdate: any;
  public disablePaymentDone: boolean;
  public disableStock: boolean;
  public disabledHightPriority: boolean;
  public disabledState: boolean;
  private messageStorageCheck: string = undefined;
  private hasStoragePayment: boolean;
  private odsOfCase : InternalCaseResponse;
  private originStorer: boolean;
  caseUpdate : InternalCaseResponse;
  listCaseStates: WarrantyItem[];
  listCaseStatesStore: WarrantyItem[];
  showStockAvailabilty: boolean = false;
  stock01Available: boolean = false;// provisional mientras se entrega servicio
  paymentMade: boolean = false
  public showMemorandumCheck: boolean = false;
  public memorandumAccepted: boolean;
  public showReceiveReturnedProductCheck: boolean = false;
  public receiveReturnedProductChecked: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data,
             private dialog: MatDialog,
             public dialogRef: MatDialogRef<InternalCaseDetailComponent>,
             private externaslService: ExternalService,
             private traceabilityWs: TraceabilityOtp,
             private sg: SimpleGlobal,
             private custom: CustomService,
             private warrantyService: WarrantyService

  ) {
    console.log('data modal',data);
    this.parameters = this.custom.GetParametersGroup();
    this.listCaseStates = data.listCaseStates;
    this.listCaseStatesStore = data.listCaseStates;
    this.odsOfCase = data.odsOfCase;
    this.updateODS = data.odsOfCase.updateODS;
    this.caseUpdate = data.selectedCase;
    this.originStorer = data.originStorer || false
    this.showPaymentCheck = !data.paymentCheck ? false : true
    this.showMemorandumCheck = !data.showMemorandumCheck ? false : true
    // this.caseUpdate.hasPriority = this.caseUpdate.priority === 1

    this.paymentMade = this.getStatusPayment
    this.odsRequest = this.warrantyService.GetUpdateODSRequest({odsOfCase: this.odsOfCase,selectedCase: this.caseUpdate})
    this.showStockAvailabilty = (data.originStorer && !this.odsRequest?.repairEquipmentWithCost)|| false;        
    this.showReceiveReturnedProductCheck = sessionStorage.getItem('nombrePerfil') == 'ALMACENISTA' ? true : false;

    console.log(JSON.stringify(this.caseUpdate));
    //Activar o desactivar checks cuando es una actualización del modal.
    if(!this.caseUpdate.observations){
      this.caseUpdate.hasPriority = false;
      // this.caseUpdate.stock = false;
      // Validación campo "stock" en true
      if(this.caseUpdate.stock && data.originStorer){
        this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.StockWithTrue, true);
        this.disableStock = true;
      }
    }else{
      this.disabledHightPriority = true;
      this.disableStock = true;
      this.disablePaymentDone = true;
    }
    // this.stock01Available = this.caseUpdate.stock
    // Condición Perfil Almacenista Check Stock Desactivado cuando el estado es igual a "Asignado" = 11
    if (this.caseUpdate.state === 11 && data.originStorer){
      this.disableStock = true;
    }

    //Prioridad alta:
    // this.caseUpdate.hasPriority = data.selectedCase.hasPriority;
    // this.originStorer = true;
    // this.caseUpdate.breachOfTime = false    
    let stateOds = Number(this.caseUpdate.state);
    console.log('stateOds Modal',stateOds);
    if (this.hasMemorandum && !this.showMemorandumCheck && this.originStorer){
      if(this.caseUpdate.breachOfTime){ //Validación check del memorando de incumplimiento
        //Valor estado a "Asignado"
        if(this.originStorer){
          this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === stateOds);
          this.caseUpdate.state = stateOds;
        }else{
          this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === 11);
          this.caseUpdate.state = 11;
        }         
      }else{
        if(stateOds !== 11 && this.caseUpdate.equipChange){
          this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === stateOds || caseState.id === 11); 
        }else{
          this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === stateOds);
        }
        this.caseUpdate.state = stateOds;
      }
      // this.disabledState = true;
      
      // Habilitación del check de Stock 01 Disponible
      this.disableStock = false;
    } else if(data.isCloseCase === true && !data.showMemorandumFormat && !data.originStorer){
      if(this.data.positiveBalance === false){
        // this.caseUpdate.state = 4;  
        this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === data.selectedCase.state || caseState.id === 4);         
      }else{
        // Cuando esta sin saldo a favor positiveBalance !== true
        console.log('cosmeticInconsistencies',data.cosmeticInconsistencies);
        if(data.cosmeticInconsistencies === false){
          this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === data.selectedCase.state || caseState.id === 4);
        }else{
          this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === data.selectedCase.state);
        }
      }
    } else{
      (data.odsOfCase.repairEquipmentWithCost && data.selectedCase?.state == 6) ?
        this.listCaseStates = this.listCaseStates.filter(caseState => caseState.name === 'AS') : this.listCaseStates = data.listCaseStates;
    }
    // Estado Almacenista PBI 1558
    if(data.originStorer) {
      if(data.showMemorandumFormat){
        this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === stateOds || caseState.name === 'AS');
      }else if(data.selectedCase.clientNotReceiveEquipment && !data.selectedCase.repairEquipmentWithCost){
        console.log('store data1');
        this.listCaseStates = this.listCaseStatesStore.filter(caseState => caseState.id === 11);
        this.caseUpdate.state = 11;
      }else{
        this.listCaseStates = this.listCaseStates.filter(caseState => caseState.id === stateOds);
      }
    }
    this.showStockAvailabilty = this.originStorer;
    this.hasStoragePayment = this.setUpForm(this.caseUpdate.daysCurrentState > this.parameters.WARRANTY_VALUES.MaximumDaysAtOriginPoint, data)
    data.consultODS === undefined ? this.consultODS = true : this.consultODS = data.consultODS;
    // this.disabledState = ((this.isOld && this.showPaymentCheck) || !this.updateODS)
  }

  private get getStatusPayment(): boolean | undefined {
    switch (this.caseUpdate.paymentNotMade) {
      case "EQUIPMENT": return this.caseUpdate.madeCashPayment
      case "STORAGE": return this.caseUpdate.paidStorage
      default: return undefined
    }
  }

  private setStatusPayment(status : boolean):void {
    switch (this.caseUpdate.paymentNotMade) {
      case "EQUIPMENT":
        this.caseUpdate.madeCashPayment = status
        break;
      case "STORAGE":
        this.caseUpdate.paidStorage = status
        break
      default: break;
    }
  }

  private get hasMemorandum(): boolean {
    //return true; // QUEMADO
    return this.odsOfCase.repairState === RepairState.ReparedWithNoCost &&
          !this.odsOfCase.repairEquipmentWithCost &&
          !this.odsOfCase.equipChange &&
          !this.odsOfCase.law1480Applies
  }

  private get hasReturnedProductCheck(): boolean {
    return true; // QUEMADO - Hasta que se defina que condiciones van a activar o desactivar este Check.
  }

  private setUpForm(hasStoragePayment:boolean, data:any) {
    if (this.showStockAvailabilty ) {
      // this.disableStock = !hasStoragePayment
      // this.disabledState = hasStoragePayment
      this.messageStorageCheck = hasStoragePayment
                               ? this.parameters.WARRANTY_MESSAGES.CheckStock
                               : this.parameters.WARRANTY_MESSAGES.CheckPriority
    } else {
      if(data.isCloseCase === true){
        data.selectedCase.state !== undefined ?
          this.listCaseStates = this.listCaseStates.filter(caseState => caseState.name === 'CL' || caseState.id === data.selectedCase.state) : this.listCaseStates = this.listCaseStates.filter(caseState => caseState.name === 'CL');
      } else{
        data.listCaseStates = data.listCaseStates;
      }
    }
    return hasStoragePayment
  }

  ngOnInit(): void {
    const currentDate = new Date();
    this.dateUpdate = String(currentDate.getDate()).padStart(2,'0')+ '/' + String(currentDate.getMonth()+1).padStart(2,'0') + '/' + currentDate.getFullYear();
    // this.isOld = undefined;
    this.isOld = this.caseUpdate !== undefined;
    this.titleButton = this.isOld ? 'Actualizar' : 'Crear caso interno';
    this.titleModal = this.isOld ? 'Actualización estado ODS' : 'Crear caso';
  }

  public SubmitInternalCase(): void {
    this.showError = false;
    this.caseUpdate.state = Number(this.caseUpdate.state);
    if (this.validateFields !== 'Ok') return this.util.OpenAlert(this.validateFields, false)
    // if (this.isOld && this.showStockAvailabilty) // this.caseUpdate.stock = this.stock01Available
    if ((this.isOld && this.showPaymentCheck) || !this.updateODS) this.setStatusPayment(this.paymentMade);    

    console.log('Saldo a favor',this.data.positiveBalance); //No tiene saldo a favor
    console.log('caseUpdate.state',this.caseUpdate.state);  // Recibido en punto de origen
    console.log('data.isCloseCase',this.data.isCloseCase); // No tiene novedades cosméticas

    if (typeof this.data.positiveBalance !== 'undefined' && this.isOld && this.data.isCloseCase && this.caseUpdate.state === 6 ) {
      // Actualizar el estado de la ODS a Cerrado
      if(!this.data.positiveBalance){
        return this.util.OpenAlert(this.parameters.WARRANTY_MESSAGES.PleaseUpdateODS, false);
      }      
    }

    this.caseUpdate.hasPriority ? this.caseUpdate.priority = 1 : this.caseUpdate.priority = 3;
    this.caseUpdate.breachOfTime = this.memorandumAccepted;
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'SubmitGetCase - UpdateCase', dataTraza: this.caseUpdate});
    let caseToUpdate= {headerRequest:HEADER_REQUEST} as InternalCaseResponse;
    Object.keys(this.caseUpdate).forEach(key => {  //Se ordena Json para que quede primero headerRequest
      caseToUpdate[key] = this.caseUpdate[key];
    });

    // Elimino el campo stock para no generar error en el servicio de la actualización de Caso Interno
    if(!this.originStorer){
      delete caseToUpdate['stock'];
    }
    //Dependiendo del entorno elimino el campo del objeto para no generar error en el servicio de la actualización de Caso Interno
    if(this.caseUpdate.paymentNotMade === 'STORAGE'){
      delete caseToUpdate['madeCashPayment']; 
    }else if(this.caseUpdate.paymentNotMade === 'EQUIPMENT'){
      delete caseToUpdate['paidStorage']
    }else{
      delete caseToUpdate['madeCashPayment'];
      delete caseToUpdate['paidStorage'];
    }
    // caseToUpdate.madeCashPayment = true;
    console.log('caseToUpdate',caseToUpdate);
    caseToUpdate.equipmentOnLoan = this.caseUpdate.equipmentOnLoan ? true : false;
    this.externaslService.UpdateCase(caseToUpdate).subscribe(dataResponse => {
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'SubmitGetCase - ResponseUpdateCase', error: true, valueTraza: dataResponse });
      let responseCase: GetCaseResponse;
      responseCase = dataResponse;
      if(responseCase.isValid){
        if (!this.updateODS) {
          this.dialogRef.close(true)
        } else {
          this.updateODSCase()
        }
      }else{
        this.util.OpenAlert('Error al realizar actualización', false)
      }
    }, error => {
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'SubmitGetCase - UpdateCase', error: true, valueTraza: error });
    })
  }

  private get validateFields(): string {
    //VALIDA QUE EL VALOR DE this.caseUpdate.state SE ENCUENTRE ENTRE LOS DATOS DEL SELECT DE ESTADO
    const selectedCase = this.listCaseStates.find(caseState => caseState.id === this.caseUpdate.state)
    if(!this.caseUpdate.observations){
      return 'Por favor ingresar una observación';
    }
    //ALMACENISTA:: VALIDACIONES CUANDO EL REGISTRO TIENE MEMORANDO DE ACEPTACIÓN POR INCUMPLIMIENTO
    if(this.hasMemorandum && !this.showMemorandumCheck && this.originStorer){
      if(!selectedCase || !this.caseUpdate.hasPriority) {
        return 'Por favor actualizar el estado del caso interno y marcar el check de prioridad alta';
      }
      return 'Ok'
    }

    //NO ALMACENISTA :: VALIDACIONES CUANDO EL REGISTRO TIENE MEMORANDO DE ACEPTACIÓN POR INCUMPLIMIENTO
    if(this.showMemorandumCheck && !this.memorandumAccepted){
      return 'Por favor marcar el check de Memorando de aceptación por incumplimiento en tiempos';
    }

    if (this.showReceiveReturnedProductCheck && !this.receiveReturnedProductChecked){
      return this.parameters.WARRANTY_MESSAGES.CheckReceiveReturnedProduct;
    }

    if(this.showStockAvailabilty
      && (!this.caseUpdate.observations
      || ((this.hasStoragePayment && !this.caseUpdate.stock)
      || (!this.hasStoragePayment && (!this.caseUpdate.hasPriority || !selectedCase))))){
      return this.messageStorageCheck;
    }

    if (!selectedCase) return 'Por favor seleccionar el estado del caso y actualizar el caso interno'

    if(this.caseUpdate.state === 11 && !this.caseUpdate.hasPriority && !this.disabledHightPriority){//validacion estado asignado
      return 'Por favor actualizar el estado del caso interno y marcar el check de prioridad alta';
    }

    if(((this.isOld && this.showPaymentCheck) || !this.updateODS) && this.caseUpdate.paymentNotMade && this.paymentMade){
      return this.parameters.WARRANTY_MESSAGES.CheckPayDone;
    }

    return 'Ok'
  }

  public OnKeyUp(val: string, box: string): boolean {
    this.internalCaseValues[box] = false;
    if (val === "" || (val !== "" && !val?.toString().match(/^[A-Za-zÁÉÍÓÚáéíóúñÑ0-9\s\.\-\,]+$/g))) {
      this.internalCaseValues[box] = true;
      return false;
    } else {
      return true;
    }
  }

  public updateODSCase():void{
    this.showError = false;
    this.odsRequest.state = this.caseUpdate.state;
    if (this.caseUpdate.observations == null || this.caseUpdate.observations == undefined || this.caseUpdate.observations == '') this.caseUpdate.observations = '  ';
    this.odsRequest.observationsD = this.caseUpdate.observations;
    this.odsRequest.receiveReturnedProduct = this.receiveReturnedProductChecked;
    const odsRequestToUpd = new ODSRequest();
    odsRequestToUpd.headerRequest= HEADER_REQUEST;
    odsRequestToUpd.idOds = this.odsRequest.idOds;
    this.warrantyService.GetODS(odsRequestToUpd).subscribe(respODS=>{
      if(respODS.isValid){
        const ODSAsociated = respODS.odsResponse[0];
        this.odsRequest.equipmentOnLoan = ODSAsociated.equipmentOnLoan;
        this.odsRequest.service = ODSAsociated.service;
        this.odsRequest.doa = ODSAsociated.doa;
        this.odsRequest.equipLoan = ODSAsociated.equipLoan;
        this.odsRequest.loanType = ODSAsociated.loanType;
        this.odsRequest.attentionCenter = ODSAsociated.attentionCenter;
        this.odsRequest.lineSuspension = ODSAsociated.lineSuspension;
        this.odsRequest.distributor = ODSAsociated.distributor;
        this.odsRequest.comments = ODSAsociated.comments;
        this.odsRequest.lineSuspensionI = ODSAsociated.lineSuspensionI;
        this.odsRequest.equipLoanI = ODSAsociated.equipLoanI;
        this.odsRequest.detail = ODSAsociated.detail;
        this.odsRequest.delivery = ODSAsociated.delivery;
        this.odsRequest.sympton = ODSAsociated.sympton;
        this.odsRequest.repair = ODSAsociated.repair;
        this.odsRequest.reviewed = ODSAsociated.reviewed;
        this.odsRequest.reviewDate = ODSAsociated.reviewDate;
        this.odsRequest.repairDate = ODSAsociated.repairDate;
        if(ODSAsociated.newEquipment){
          let newEq :NewEquipment = {imei: ODSAsociated.newEquipment.imei, serial: ODSAsociated.newEquipment.serial,brand: ODSAsociated.newEquipment.brand, model: ODSAsociated.newEquipment.model, sap:ODSAsociated.newEquipment.sap };
          this.odsRequest.newEquipment = newEq;
        } else this.odsRequest.newEquipment = null;
        this.odsRequest.equipChange = ODSAsociated.equipChange;
        ODSAsociated.part?.length >0 ? this.odsRequest.part = ODSAsociated.part : this.odsRequest.part =[];
        ODSAsociated.qualitystate?.length >0 ? this.odsRequest.qualitystate = ODSAsociated.qualitystate : this.odsRequest.qualitystate =[];
        this.odsRequest.responseLaw = ODSAsociated.responseLaw;
        this.odsRequest.requiresWithdrawalForm = ODSAsociated.requiresWithdrawalForm;
        this.odsRequest.invoiceDate = ODSAsociated.invoiceDate;
        this.odsRequest.enterWithAccessories = ODSAsociated.enterWithAccessories;
        ODSAsociated.accessoriesEntered?.length>0 ? this.odsRequest.accessoriesEntered = ODSAsociated.accessoriesEntered : this.odsRequest.accessoriesEntered =[];
        this.odsRequest.equipmentType = ODSAsociated.equipmentType;
        this.odsRequest.repairState = ODSAsociated.repairState;
        this.odsRequest.entryPerWarranty = ODSAsociated.entryPerWarranty;
        this.odsRequest.processedWarrantySameFailure = ODSAsociated.processedWarrantySameFailure;
        this.odsRequest.repairEquipmentWithCost = ODSAsociated.repairEquipmentWithCost;
        this.odsRequest.warrantyAppliesCompensation = ODSAsociated.warrantyAppliesCompensation;
        this.odsRequest.equipmentImpactsBrokenScreen = ODSAsociated.equipmentImpactsBrokenScreen;
        this.odsRequest.equipmentWithoutLabelSerial = ODSAsociated.equipmentWithoutLabelSerial;
        this.odsRequest.commentsCosmeticReviewStatus =ODSAsociated.commentsCosmeticReviewStatus;
        this.odsRequest.totalValueRepair = ODSAsociated.totalValueRepair;
        this.odsRequest.clientReturnEquipmentLoan = ODSAsociated.clientReturnEquipmentLoan;
        this.odsRequest.reviewEquipmentLoanWasApproved = ODSAsociated.reviewEquipmentLoanWasApproved;
        this.odsRequest.descriptionAccessoriesEnterWarranty = ODSAsociated.descriptionAccessoriesEnterWarranty;
        this.odsRequest.law1480Applies = ODSAsociated.law1480Applies;
        this.odsRequest.applyEquipmentChange = ODSAsociated.applyEquipmentChange;
        this.odsRequest.moneyBackApplies = ODSAsociated.moneyBackApplies;
        this.odsRequest.moneyRefundMade = ODSAsociated.moneyRefundMade;
        this.odsRequest.repairedBy = ODSAsociated.repairedBy;
        this.odsRequest.faultFixedByBarTechnician = ODSAsociated.faultFixedByBarTechnician;
        this.odsRequest.clientSatisfiedBarTechnicianSolution = ODSAsociated.clientSatisfiedBarTechnicianSolution;
        this.odsRequest.customerDisagreementDetails = ODSAsociated.customerDisagreementDetails;
        this.odsRequest.idUserDiagnosis = ODSAsociated.idUserDiagnosis;
        this.odsRequest.idTechnicalDiagnosis = ODSAsociated.idTechnicalDiagnosis;
        this.odsRequest.diagnosticObservations = ODSAsociated.diagnosticObservations
        this.odsRequest.paymentMethod = ODSAsociated.paymentMethod;
        this.odsRequest.paymentConcept = ODSAsociated.paymentConcept;
        this.odsRequest.clientNotReceiveEquipment = ODSAsociated.clientNotReceiveEquipment;
        this.odsRequest.equipmentUnderWarranty = ODSAsociated.equipmentUnderWarranty;
        this.odsRequest.equipmentPresentedRealFault = ODSAsociated.equipmentPresentedRealFault;
        this.odsRequest.firstContactDate = ODSAsociated.firstContactDate;
        this.odsRequest.equipmentEntryDate = ODSAsociated.equipmentEntryDate;
        //
        const action = this.isOld ? 'modificado' : 'creado';
        this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'SubmitGetODS - UpdateCase', dataTraza: this.odsRequest});
        this.externaslService.UpdateODS(this.odsRequest).subscribe(dataResponse => {
          this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'SubmitGetCase - ResponseUpdateCase', error: true, valueTraza: dataResponse });
          let responseCase: GetCaseResponse;
          responseCase = dataResponse;
          if(responseCase.isValid){
            if (this.odsRequest.state === 4) this.sg['closedCase'] = 'true'
            this.disableUpdateInternalCase = true
            // Mejora en validación de mensajes cuando se actuliza la ODS
            if(this.caseUpdate.stock && this.caseUpdate.state !== 11) {
              this.msgInfoHandler(this.parameters.WARRANTY_MESSAGES.RememberStorage)
            }else if(this.caseUpdate.state === 11 && this.caseUpdate.hasPriority) {
                this.msgInfoHandler(this.parameters.WARRANTY_MESSAGES.ReceivedForReview)
            }else{
              this.dialogRef.close({resp:true, ods: this.odsRequest});
            }
            
          }else this.errorHandler(responseCase.message, this.util)
        })
      }
    });
  }

  private msgInfoHandler(message: string) {
    // this.util.getMessageModal(message).afterClosed().subscribe(resp => { if (resp) {setTimeout(()=>  this.dialogRef.close(true),5000)}});
    this.util.getMessageModal(message).afterClosed().subscribe(resp => { if (resp) {
      this.dialogRef.close(true);
    }});
  }

  private errorHandler(error: Object | string, util: Util) {
    const errorMsg = util.getMessageModal('Ha ocurrido un error al intentar actualizar la ODS', 'fail-alert')
    errorMsg.afterClosed().subscribe(resp => {
     if (resp) {
      this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'SubmitGetCase - UpdateCase', error: true, valueTraza: error });
      this.dialogRef.close(true);
     }
    })
  }

}
