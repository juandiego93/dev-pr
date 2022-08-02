import { Adjustment } from './../../../models/adjustment';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DataTransform, WsSoapService } from 'ws-soap-lib';

import { Util } from 'src/app/shared/util';
import { TraceabilityOtp } from '../../../services/traceabilityOtp.service';
import { RequestTraceabilityOtp } from 'src/app/models/traceabilityOtp';
import { Parameter } from './../../../models/parameter';
import { CustomService } from './../../../services/custom.service';
import { Guarantee } from './../../../models/guarantee';
import { DecisionTableModalComponent } from 'src/app/shared/decision-table-modal/decision-table-modal.component';
import { ExternalService } from '../../../services/external.service';
import { map } from 'rxjs/operators';
import { IGetConcepts, Concept, TypeAdjustments } from '../../../models/getConcepts';
import { HEADER_REQUEST } from '../../../models/headerRequest';
import { IApplyAdjustment } from '../../../models/ApplyAdjustment';

@Component({
  selector: 'app-create-occ',
  templateUrl: './create-occ.component.html',
  styleUrls: ['./create-occ.component.scss']
})
export class CreateOCCComponent implements OnInit {

  private util = new Util(this.dialog);
  private traceability = { error: false } as RequestTraceabilityOtp;
  private parameters: Parameter

  public guarantee: Guarantee;
  public emptyValues = false;
  public typeAdjustment: Array<TypeAdjustments> = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: Guarantee,
    public dialogRef: MatDialogRef<DecisionTableModalComponent>,
    private dialog: MatDialog,
    private traceabilityWs: TraceabilityOtp,
    private custom: CustomService,
    private wsSoapService: WsSoapService,
    private externalService: ExternalService) { this.guarantee = data }

  ngOnInit(): void {
    //evalua el parametro y si es inspira el  booleano sera true si es op actual sera false
    this.guarantee.boolSourceOriginCurrentOperation ? this.GetConcepts() : this.SetRequestGetAdjustmentsManagement() ;
  }

  public SubmitCreateOCC(): void {
    if ((this.guarantee.account !== undefined && this.guarantee.account !== null && this.guarantee.account !== '')
      && (this.guarantee.totalcostLoanEquipment !== undefined && this.guarantee.totalcostLoanEquipment !== null)
      && (this.guarantee.adjustment !== undefined && this.guarantee.adjustment.remark !== undefined)) {
      this.emptyValues = false;
     //evalua el booleano y si es operacion actual el  booleano sera true si es op inspira sera false

     this.guarantee.boolSourceOriginCurrentOperation ? this.ApplyAdjustments() : this.SetRequestChargesNotification();
    } else {
      this.emptyValues = true;
      return;
    }
  }

  // Método para preparar request de consumo para servicio de GetAdjustmentsManagement
  private SetRequestGetAdjustmentsManagement(): void {
    this.parameters = this.custom.GetParametersGroup();
    const wsGetAdjustmentsM = this.parameters.URLSERVICIOSG.WsGetAdjustmentsManagement;
    let dataTransform = {
      arrayData: [
        // Header
        { name: 'idApplication', value: this.guarantee.idFlow },
        { name: 'startDate', value: this.util.ActualDate() },
        { name: 'userApplication', value: this.guarantee.idUser },
      ]
    } as DataTransform;
    this.ConsumeGetAdjustmentsManagement(wsGetAdjustmentsM.Url, wsGetAdjustmentsM.Xml, dataTransform);
  }

  private ApplyAdjustments(): void {
    const params: IApplyAdjustment = {
      headerRequest: HEADER_REQUEST,
      adjustmentType: "A",
      customerIdSource: this.guarantee.customerId,
      customerIdDestination: this.guarantee.customerId,
      accountingAccount: this.guarantee.adjustment.charge,
      amount: this.guarantee.totalcostLoanEquipment.toString(),
      iva: "19",
      idInvoice: "111111",
      comment: "Test",
      jobCost: "10",
      user: this.guarantee.idUser,
     }

    this.externalService.PostApplyAdjustment(params)
    .subscribe(({isValid, message}) => {
      if (isValid && message.toUpperCase() === 'SUCCESS') this.dialogRef.close(true);
      else this.util.OpenAlert(`No se ha podido crear la OCC. ${message}` , false);
    }, err=> {
      this.custom.SetMessageError = 'Error en servicio para la creación de la OCC ';
    })
  }

  private GetConcepts(): void {
    const params: IGetConcepts = { ...HEADER_REQUEST, indicatorId: "1" }
    this.externalService.PostGetConcepts(params)
    .pipe(map( res => ({...res, message: JSON.parse(res.message.toString())})))
    .subscribe(({isValid, message}) => {
      if (isValid && message && message.length > 0) this.setConceptsInfo(message)
      else this.util.OpenAlert(`Tipos de ajustes no encontrados (GetConcepts).` , false);
    }, err=> {
      this.custom.SetMessageError = 'Error en servicio para consulta de tipos de ajuste ';
    })
  }

  private setConceptsInfo(concepts: Array<Concept>) {
    const list: Array<Concept> = concepts.sort((a, b) => 0 - (a.DESCRIPCION_CTA.toUpperCase() > b.DESCRIPCION_CTA.toUpperCase() ? -1 : 1));
    list.forEach(({CUENTA_CONTABLE, DESCRIPCION_CTA}) => {
      if (DESCRIPCION_CTA != undefined && DESCRIPCION_CTA != "NULL") {
        this.typeAdjustment.push({ charge: CUENTA_CONTABLE, remark: DESCRIPCION_CTA })
      }
    });
  }

  // Método para consultar servicios de GetAdjustmentsManagement
  private ConsumeGetAdjustmentsManagement(url: string, xmlString: string, data: DataTransform): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeGetAdjustmentsManagement - GetAdjustmentsManagement', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        this.wsSoapService.wsSoap(url, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeGetAdjustmentsManagement - GetAdjustmentsManagement', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'tns:responseStatus').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus['0']['status']['0']).toLowerCase() === "ok") {
                    this.ValidateGetAdjustmentsManagement(jsonResponse);
                  } else {
                    this.util.OpenAlert('Error al consultar servicio(GetAdjustmentsManagement) para consulta de tipos de ajustes: ' + responseStatus['0']['message'] + '. ' +
                      this.parameters.WARRANTY_MESSAGES.Refresh, false);
                  }
                }
              );
            } catch (error) {
              this.util.OpenAlert('Error al consultar servicio(GetAdjustmentsManagement) para consulta de tipos de ajustes: ' + error + '. ' +
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
        this.util.OpenAlert('Error al consultar servicio(GetAdjustmentsManagement) para consulta de tipos de ajustes: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.Refresh, false);
      }
    );
  }

  // Método para validar respuesta de servicio de GetAdjustmentsManagement
  private ValidateGetAdjustmentsManagement(jsonResponse: string): void {
    this.wsSoapService.getObjectByElement(jsonResponse, 'tns:adjustments').then(
      (response) => {
        if (response.length > 0) {
          let adjustmentList: Adjustment[];
          adjustmentList = JSON.parse(JSON.stringify(response).split('tns:').join(''));
          const list = adjustmentList[0].adjustment.sort((a, b) => 0 - (a.remark[0].toUpperCase() > b.remark[0].toUpperCase() ? -1 : 1));
          list.forEach(adj => {
            if (adj.remark[0] != undefined && adj.remark[0] != "NULL") {
              this.typeAdjustment.push({ charge: adj.chargeService[0], remark: adj.remark[0] })
            }
          });
        } else {
          this.util.OpenAlert('Tipos de ajustes no encontrados (GetAdjustmentsManagement). ' +
            this.parameters.WARRANTY_MESSAGES.EndAttention, false);
        }
      }, (error) => {
        this.util.OpenAlert('Error al consultar servicio(GetAdjustmentsManagement) para consulta de tipos de ajuste: ' + error + '. ' +
          this.parameters.WARRANTY_MESSAGES.EndAttention, false);
      }
    );
  }

  // Método para preparar request de consumo para servicio de ChargesNotification
  private SetRequestChargesNotification(): void {
    const wsChargesNotification = this.parameters.URLSERVICIOSG.WsChargesNotification;
    let dataTransform = {
      arrayData: [
        // Header
        { name: 'idApplication', value: this.guarantee.idFlow },
        { name: 'startDate', value: this.util.ActualDate() },
        { name: 'userApplication', value: this.guarantee.idUser },
        // Body
        { name: 'accountNumber', value: this.guarantee.account },
        { name: 'amount', value: this.guarantee.totalcostLoanEquipment },
        { name: 'remark', value: this.guarantee.adjustment.remark }
      ]
    } as DataTransform;
    this.ConsumeChargesNotification(wsChargesNotification.Url, wsChargesNotification.Xml, dataTransform);
  }

  // Método para consultar servicios de ChargesNotification
  private ConsumeChargesNotification(url: string, xmlString: string, data: DataTransform): void {
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeChargesNotification - ChargesNotification', dataTraza: xmlString });
    this.wsSoapService.getDataXMLTrans(xmlString, data).then(
      (xml) => {
        this.wsSoapService.wsSoap(url, xml).then(
          (jsonResponse) => {
            this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'ConsumeChargesNotification - ChargesNotification', valueTraza: jsonResponse });
            try {
              this.wsSoapService.getObjectByElement(jsonResponse, 'responseStatus').then(
                (responseStatus) => {
                  if (responseStatus.length > 0 && (responseStatus['0']['status']['0']).toLowerCase() === "ok") {
                    this.dialogRef.close(true);
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
}
