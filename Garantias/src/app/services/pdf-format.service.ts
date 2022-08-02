import { HEADER_REQUEST } from 'src/app/models/headerRequest';
import { Injectable } from '@angular/core';
import { CustomService } from '../services/custom.service';
import { DatePipe } from '@angular/common';
import { environment } from '../../environments/environment.prod';
import { Departments } from '../models/citiesdepartments';
import { ImeiToolsService } from '../services/imeitools.service';
import { Ods, ODSRequest, ODSTemplate, Part, UploadedFileResponse, UploadedFileResponseItem, FormatTemplate, RepairState } from '../models/ods';
import { MatDialog } from '@angular/material/dialog';
import { ModalMicrositesComponent } from '../shared/microsites-modal/microsites-modal.component';
import { Parameter } from '../models/parameter';
import { RequestTraceabilityOtp } from '../models/traceabilityOtp';
import { TraceabilityOtp } from '../services/traceabilityOtp.service';
import { TypeDocument } from '../models/documentType';
import { Util } from '../shared/util';
import { WarrantyItem, Warranty } from '../models/case';
import { WarrantyService } from '../services/warranty.service';

@Injectable({
  providedIn: 'root'
})

export class PDFFormatService {

  public documentTypes: TypeDocument[];
  private listDepartments: Departments[]
  private listWarranty: Warranty[];
  private odsRequest: ODSRequest;
  private odsTemplate = new ODSTemplate()
  private odsValue: Ods
  private parameters: Parameter;
  private traceability = { error: false } as RequestTraceabilityOtp;
  private util = new Util(this.dialog);
  private rpUploadedFile: UploadedFileResponse;
  private docsEIF:UploadedFileResponseItem[];
  private docsDYR: UploadedFileResponseItem[];
  private template;

  constructor(
    private custom: CustomService,
    private datepipe: DatePipe,
    private dialog: MatDialog,
    private imeiTools: ImeiToolsService,
    private traceabilityWs: TraceabilityOtp,
    private warrantyService: WarrantyService
  ) { }

  public GetODSFormat(idOds: string, template = FormatTemplate.ODSFormat) {
    let getOdsFormat = () => {
      this.parameters = this.custom.GetParametersGroup();
      this.odsRequest = new ODSRequest();
      this.odsRequest.headerRequest = HEADER_REQUEST;
      this.odsRequest.idOds = idOds
      this.warrantyService.GetODS(this.odsRequest).subscribe(respOds =>{
        if(respOds.isValid){
          if(respOds.odsResponse!== undefined && respOds.odsResponse?.length > 0){
            this.odsValue = respOds.odsResponse[0];
            this.odsValue.repairEquipmentWithCost = respOds.odsResponse[0].repairState === RepairState.ReparedWithCost || false
            if(template === FormatTemplate.NonComplianceFormat) this.ConsultODS(template)
            else{
              this.template = template;
              this.warrantyService.GetUploadedFile(idOds).subscribe(respUploaded=> this.rpUploadedFile = respUploaded,
                () => this.custom.SetMessageError = 'No se pudo obtener imagenes asociadas a ODS ', //{this.util.OpenAlert('No se pudo obtener imagenes asociadas a ODS', false)},
                () => {this.GetDepartmentsAndODS();}
                );
              }
            }
        }
      });
    }
    if(!this.listWarranty){
      this.warrantyService.GetLists().then(response=>{
        if(response){
          getOdsFormat();
        } else {
          if(this.custom.GetCountError() <= environment.ic){
            this.GetODSFormat(idOds, template);
          }
        }})
    } else getOdsFormat()

  }

  private GetDepartmentsAndODS(){
    this.GetDepartments().then(() => this.ConsultODS(this.template));
  }

  private  ConsultODS (template: FormatTemplate) {
    if (template === FormatTemplate.ODSFormat && this.rpUploadedFile.isValid && this.rpUploadedFile.uploadedFileResponse !== undefined && this.rpUploadedFile.uploadedFileResponse?.length > 0) {
      const DOCEIF = this.rpUploadedFile.uploadedFileResponse.filter(file => file.fileSectionID === 1);
      const DOCDYR = this.rpUploadedFile.uploadedFileResponse.filter(file => file.fileSectionID === 2);
      this.docsEIF = DOCEIF !== undefined && DOCEIF?.length > 0 ? DOCEIF : [];
      this.docsDYR = DOCDYR !== undefined && DOCDYR?.length > 0 ? DOCDYR : [];
    } else{
      this.docsDYR = [];
      this.docsEIF = [];
    }
    const objBase64 = (template === FormatTemplate.NonComplianceFormat)
                    ? btoa(JSON.stringify(this.GetTemplateNonCompliance()))
                    : btoa(JSON.stringify(this.GetTemplate())) ;            
    const url = `${this.parameters.URLServicios.DynamicDoc}?data=${objBase64}`;
    this.custom.GetBase64FileToSend().next(url);
    this.traceabilityWs.InsertTraceabilityOtp({ ...this.traceability, descriptionTraza: 'getFormat - DynamicDocuments', dataTraza: url });
    const dialogRef = this.dialog.open(ModalMicrositesComponent, {
      width: '90%',
      height: '90%',
      disableClose: true,
      data: { urlSite: url, anexo: true }
    });
    dialogRef.afterClosed().subscribe(resp => {
     if(resp) {
      if (this.odsTemplate.idTemplate === template) {
        this.custom.ODCGenerated().next(true);
      }
     }
    });
  }

  private returnitemsWarrante(search: string): WarrantyItem[]{
    let listObjWarranty: WarrantyItem[];
    listObjWarranty =  this.listWarranty.find(WarrantyItem=> WarrantyItem.nameList === search).value;
    return listObjWarranty;
  }

  private GetDepartments(): Promise<boolean>{
    return new Promise ((resolve, reject)=> {
      this.imeiTools.getCitiesDepartment().subscribe(response =>{
        this.custom.DelCountError();
        if(response.isValid){
          this.listDepartments = JSON.parse(response.message);
          resolve(true)
        } else{
          this.util.OpenAlert('No se trajo información de ciudades y departamentos', false)
          resolve(false)
        }
      }, error => {
        this.custom.AddCountError();
        if(this.custom.GetCountError() <= environment.ic){
          this.GetDepartmentsAndODS();
        } else{
          this.custom.SetMessageError = 'Error al obtener ciudades y departamentos: ';
          this.custom.DelCountError();
        }
      });
    })
  }

  private transformBoolean(valBool: boolean): string{
    let result: string = ' '
    if(valBool !== undefined && valBool !== null){
      valBool === true ? result += 'SI': result += 'NO';
    }
    return result;
  }

  private validateValueNullOrEmpty(value: any): any{
    let valueReturn : any;
    if(value !== undefined && value != '' && value !== null){
      valueReturn = value;
    } else {
      valueReturn = ' ';
    }
    return valueReturn;
  }

  private GetTemplate(): ODSTemplate {
    let odsImage: any;
    let tscResult;
    if(this.odsValue.tsc === 1 ){
      odsImage = this.parameters.IMAGEHEADERODS.image_woden64;
      tscResult = 'woden';
    } else if (this.odsValue.tsc === 2 ){
      odsImage = this.parameters.IMAGEHEADERODS.image_logytech64;
      tscResult = 'logytech';
    } else{
      odsImage = this.parameters.IMAGEHEADERODS.imageOnlyClaro64;
      tscResult = 'claro';
    }
    this.listWarranty = this.warrantyService.GetListWarranty()
    this.documentTypes = this.imeiTools.GetListTypeDocument();

    const obDepartmentClient: Departments = this.listDepartments.find(dep => dep.Code == String(this.odsValue.client?.department));
    const departmentClientStr = obDepartmentClient !== undefined ? obDepartmentClient.Description : ' ';
    const city = obDepartmentClient !== undefined ? obDepartmentClient.Cities?.find(city => city.Code == String(this.odsValue.client?.city))?.Description: ' ';
    const period_ = this.returnitemsWarrante('PERIOD').find(warranty => warranty.id === this.odsValue.period)?.description || ' ';
    const delivery_ = this.returnitemsWarrante('DELIVERY').find(warranty=> warranty.id === this.odsValue.delivery)?.description || ' ';
    const case_ = this.returnitemsWarrante('CASE_EQUIPMENT').find(warranty => warranty.id === this.odsValue.equipment?.case)?.description || ' ';
    const keyboard_ = this.returnitemsWarrante('KEYBOARD').find(warranty => warranty.id === this.odsValue.equipment?.keyboard)?.description;
    const connectors_ = this.returnitemsWarrante('CONNECTOR').find(warranty => warranty.id === this.odsValue.equipment?.connectors)?.description || ' ';
    const charger_ = this.returnitemsWarrante('CHARGER').find(warranty => warranty.id === this.odsValue.equipment?.charger)?.description || ' ';
    const memoryCard_ = this.returnitemsWarrante('MEMORY_CARD').find(warranty => warranty.id === this.odsValue.equipment?.memoryCard)?.description || ' ';
    const screen_ = this.returnitemsWarrante('SCREEN').find(warranty => warranty.id = this.odsValue.equipment?.screen)?.description || ' ';
    const battery_ = this.returnitemsWarrante('BATTERY').find(warranty => warranty.id == this.odsValue.equipment?.battery)?.description || ' ';
    const batteryCover_ = this.returnitemsWarrante('BATTERY_COVER').find(warranty => warranty.id === this.odsValue.equipment?.batteryCover)?.description || ' ';
    const freehands_ = this.returnitemsWarrante('FREEHANDS').find(warranty=> warranty.id === this.odsValue.equipment?.freehands)?.description || ' ';
    const viewfinder_ = this.returnitemsWarrante('VIEWFINDER').find(warranty => warranty.id === this.odsValue.equipment?.viewfinder)?.description || ' ';
    const typeDocument_ = this.documentTypes.find(doc => doc.Id == String(this.odsValue.client?.documentType))?.Description || ' ';
    const screenP_ = this.returnitemsWarrante('SCREEN_EOL').find(warranty => warranty.id === this.odsValue.equipmentOnLoan?.screen)?.description || ' ';
    const batteryP_ = this.returnitemsWarrante('BATTERY_EOL').find(warranty => warranty.id === this.odsValue.equipmentOnLoan?.battery)?.description || ' ';
    const equipmentCover_ = this.returnitemsWarrante('EQUIPMENT_COVER').find(warranty => warranty.id === this.odsValue.equipmentOnLoan?.equipmentCover)?.description || ' ';
    const keyboardP_ = this.returnitemsWarrante('KEYBOARD_EOL').find(warranty => warranty.id === this.odsValue.equipmentOnLoan?.keyboard)?.description || ' ';
    const caseEquipment_ = this.returnitemsWarrante('CASE_EQUIPMENT_EOL').find(warranty => warranty.id === this.odsValue.equipmentOnLoan?.case)?.description || ' ';
    const connectorsP_ = this.returnitemsWarrante('CONNECTOR_EOL').find(warranty => warranty.id === this.odsValue.equipmentOnLoan?.connectors)?.description || ' ';
    const humidityReader_ = this.returnitemsWarrante('HUMIDITY_READER').find(warranty => warranty.id === this.odsValue.equipmentOnLoan?.humidityReader)?.description || ' ';
    const entryPerWarranty_ = this.returnitemsWarrante('ENTRY_PER_WARRANTY').find(x => x.id === this.odsValue.entryPerWarranty)?.description || ' ';
    const repairState_ = this.returnitemsWarrante('REPAIR_STATE').find(x => x.id=== this.odsValue.repairState)?.description || ' ';
    const listAccesories__= this.returnitemsWarrante('ACCESSORIES_ENTERED');
    const speakers_ = this.returnitemsWarrante('SPEAKERS_STATE').find(x => x.id  === this.odsValue.equipment?.speakers)?.description || ' ';
    const cpuState_ = this.returnitemsWarrante('CPU_STATE').find(x => x.id === this.odsValue.equipment?.cpu)?.description || ' ';
    const mouse_ = this.returnitemsWarrante('MOUSE_STATE').find(x => x.id === this.odsValue.equipment?.mouse)?.description || ' ';
    const state_  = this.returnitemsWarrante('INTERNAL_CASE_STATE').find(x => x.id === this.odsValue.state)?.description || ' ';

    const qualityStateArray = this.odsValue.qualitystate;
    //Recorrer estado de calidad
    let qualitystate_: string = ''
    let i = 0;
    if(qualityStateArray !== undefined && qualityStateArray?.length > 0){
      qualityStateArray.forEach(quality =>{
        const descQuality = this.returnitemsWarrante('QUALITY_STATE').find(warranty => warranty.id === quality.idQualityState).description || '';
        if(descQuality !==''){
          i++;
          qualitystate_ += i > 1 ? '</br>' : '';
          qualitystate_ += i + '. ' + descQuality;
        }
      });
    }
    //Recorrer Repuestos
    let repairings: Part[] = this.odsValue.part || [];
    let partsTable_ = ' ';
    let totalValueR_ = 0;
    if (repairings?.length > 0){
      repairings.forEach(repuesto => {
        totalValueR_ += repuesto.totalvalue || 0;
        partsTable_ += `<tr>
        <td colspan="1" style="font:bold 10px 'Arial';color:#333333;line-height:10px;font-weight:bold;">
        </td>
        <td colspan="2" style="background: #E6E4E4;font-size: 10px;">${repuesto.description}</td>
        <td colspan="1" style="background: #E6E4E4;font-size: 10px;">${repuesto.amount}</td>
        <td colspan="1" style="background: #E6E4E4;font-size: 10px;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(repuesto.value))}</td>
        <td colspan="1" style="background: #E6E4E4;font-size: 10px;">${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(repuesto.totalvalue))}</td></tr>`
      });
    }
    const checkDate_ =  this.datepipe.transform(this.odsValue.reviewDate, 'dd/MM/yyyy') || ' '
    const repairDate_ = this.datepipe.transform(this.odsValue.repairDate, 'dd/MM/yyyy') || ' ';
    const finalStatus_ = this.returnitemsWarrante('INTERNAL_CASE_STATE').find(x => x.id  === this.odsValue.state)?.description || ' ';
    const enterWithAccesories_ = this.transformBoolean(this.odsValue.enterWithAccessories) || ' ';
//documentos de estado de inspeccion fisica
    let docsEIF_ = '';
    let k = 0;
    if (this.docsEIF?.length > 0) {
      this.docsEIF.forEach(file => {
        if (this.util.fullfilledField(file.name)) {
          k++;
          docsEIF_ += k > 1 ? '</br>' : '';
          docsEIF_ += k + '. ' + file.name;
        }
      });
    }
    //Documentso de diagnostico y reparacion
    let docsDYR_ = '';
    let j = 0;
    if (this.docsDYR?.length >0) {
      this.docsDYR.forEach(file => {
        if (this.util.fullfilledField(file.name)) {
          j++;
          docsDYR_ += j > 1 ? '</br>' : '';
          docsDYR_ += j + '. ' + file.name;
        }
      });
    }
    //validacion de array de accesorios
    let accessoriesEntered_ :any;
    if( this.odsValue.enterWithAccessories && this.odsValue.accessoriesEntered?.length >0){
      accessoriesEntered_ = this.odsValue.accessoriesEntered.reduce((val, item) => (val + listAccesories__.find(y => y.id == item.idAccessoriesEntered)?.description) + ', ', '' );
    }


    this.odsTemplate = {      
      data: {
        idOds: this.validateValueNullOrEmpty(this.odsValue.idOds),
        idInternalCase: this.validateValueNullOrEmpty(this.odsValue.idInternalCase),
        idEquipment: this.validateValueNullOrEmpty(this.odsValue.idEquipment),
        client_documentType : typeDocument_,
        client_documentNumber : this.validateValueNullOrEmpty(this.odsValue.client?.documentNumber),
        client_name : this.validateValueNullOrEmpty(this.odsValue.client?.name),
        client_phone : this.validateValueNullOrEmpty(this.odsValue.client?.phone),
        client_email: this.validateValueNullOrEmpty(this.odsValue.client?.email),
        client_city: city,
        client_department:departmentClientStr,
        client_address : this.validateValueNullOrEmpty(this.odsValue.client?.address),
        client_account : this.validateValueNullOrEmpty(this.odsValue.client?.account),
        // datos del equipo
        equipment_imei: this.validateValueNullOrEmpty(this.odsValue.equipment?.imei),        
        equipment_min: this.validateValueNullOrEmpty(this.odsValue.equipment?.min),
        equipment_brand: this.validateValueNullOrEmpty(this.odsValue.equipment?.brand),
        equipment_model: this.validateValueNullOrEmpty(this.odsValue.equipment?.model),
        equipment_color: this.validateValueNullOrEmpty(this.odsValue.equipment?.color),
        equipment_keyboard: this.validateValueNullOrEmpty(keyboard_),
        equipment_connectors: connectors_,
        equipment_screen: screen_,
        equipment_battery: battery_,
        equipment_batteryCover: this.validateValueNullOrEmpty(batteryCover_),
        equipment_case: this.validateValueNullOrEmpty(case_),        
        equipment_charger: this.validateValueNullOrEmpty(charger_),
        equipment_memoryCard: this.validateValueNullOrEmpty(memoryCard_),
        equipment_freehands: this.validateValueNullOrEmpty(freehands_),
        equipment_viewfinder: this.validateValueNullOrEmpty(viewfinder_),
        equipment_other: this.validateValueNullOrEmpty(this.odsValue.equipment?.other),
        equipment_commentsIF: this.validateValueNullOrEmpty(this.odsValue.equipment?.commentsIF),
        equipment_observations: this.validateValueNullOrEmpty(this.odsValue.equipment?.observations),
        equipment_inspect: this.validateValueNullOrEmpty(this.odsValue.equipment?.inspect),
        equipment_cosmeticReviewApproved: this.transformBoolean(this.odsValue.equipment?.cosmeticReviewApproved) || ' ',
        equipment_speakers: this.validateValueNullOrEmpty(speakers_),
        equipment_cpu: this.validateValueNullOrEmpty(cpuState_),
        equipment_mouse: this.validateValueNullOrEmpty(mouse_),   
        equipment_serial: this.validateValueNullOrEmpty(this.odsValue.equipment?.serial),     
        equipment_equipmentCover: this.validateValueNullOrEmpty(this.odsValue.equipment?.equipmentCover),
        equipment_humidityReader: this.validateValueNullOrEmpty(this.odsValue.equipment?.humidityReader),
        //Info General
        period: this.validateValueNullOrEmpty(period_),
        diagnosis: this.validateValueNullOrEmpty(this.odsValue.diagnosis),
        entryDate: this.datepipe.transform(this.odsValue.entryDate,'dd/MM/yyyy') || ' ',
        entryHour : this.validateValueNullOrEmpty(this.odsValue.entryHour),
        state: state_,
        tsc: this.validateValueNullOrEmpty(tscResult),// pendiente validar cambio 
        user: this.validateValueNullOrEmpty(this.odsValue.user),
        service : this.validateValueNullOrEmpty(this.odsValue.service),
        doa : this.transformBoolean(this.odsValue.doa) || ' ',
        equipLoan: this.transformBoolean(this.odsValue.equipLoan),
        loanType : this.validateValueNullOrEmpty(this.odsValue.loanType),
        attentionCenter: this.validateValueNullOrEmpty(this.odsValue.attentionCenter),
        lineSuspension: this.transformBoolean(this.odsValue.lineSuspension) || ' ',
        distributor: this.validateValueNullOrEmpty(this.odsValue.distributor),
        failure: this.validateValueNullOrEmpty(this.odsValue.failure),
        condition: this.validateValueNullOrEmpty(this.odsValue.condition),
        comments: this.validateValueNullOrEmpty(this.odsValue.comments),
        lineSuspensionI : this.transformBoolean(this.odsValue.lineSuspensionI) || ' ',
        equipLoanI: this.transformBoolean(this.odsValue.equipLoanI) || ' ',
        detail: this.validateValueNullOrEmpty(this.odsValue.observations),
        delivery: this.validateValueNullOrEmpty(delivery_),
        sympton : this.validateValueNullOrEmpty(this.odsValue.sympton) || ' ',
        repair: this.validateValueNullOrEmpty(this.odsValue.repair),
        reviewed: this.validateValueNullOrEmpty(this.odsValue.reviewed),
        reviewDate: checkDate_,
        repairDate: repairDate_,
        // newEquipment Section
        newEquipment_imei: this.validateValueNullOrEmpty(this.odsValue.newEquipment?.imei),
        newEquipment_serial:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.serial),
        newEquipment_brand: this.validateValueNullOrEmpty(this.odsValue.newEquipment?.brand),
        newEquipment_model:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.model),
        newEquipment_min:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.min),
        newEquipment_color:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.color),
        newEquipment_screen:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.screen),
        newEquipment_equipmentCover:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.equipmentCover),
        newEquipment_keyboard:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.keyboard),
        newEquipment_connectors:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.connectors),
        newEquipment_humidityReader:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.humidityReader),
        newEquipment_battery:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.battery),
        newEquipment_batteryCover:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.batteryCover),
        newEquipment_case:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.case),
        newEquipment_charger:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.charger),
        newEquipment_memoryCard:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.memoryCard),
        newEquipment_freehands:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.freehands),
        newEquipment_viewfinder:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.viewfinder),
        newEquipment_other:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.other),
        newEquipment_commentsIF:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.commentsIF),
        newEquipment_observations:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.observations),
        newEquipment_inspect:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.inspect),
        newEquipment_cosmeticReviewApproved:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.cosmeticReviewApproved),
        newEquipment_speakers:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.speakers),
        newEquipment_cpu:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.cpu),
        newEquipment_mouse:  this.validateValueNullOrEmpty(this.odsValue.newEquipment?.mouse),
        // More data
        observationsD:  this.validateValueNullOrEmpty(this.odsValue.observationsD),
        termsOfservice: this.validateValueNullOrEmpty(this.odsValue.termsOfservice),
        consultation: this.validateValueNullOrEmpty(this.odsValue.consultation),
        equipChange: this.transformBoolean(this.odsValue.equipChange) || ' ',
        part : this.validateValueNullOrEmpty(partsTable_),
        qualitystate: this.validateValueNullOrEmpty(qualitystate_), 
        responseLaw: this.validateValueNullOrEmpty(this.odsValue.responseLaw),
        requiresWithdrawalForm: this.transformBoolean(this.odsValue.requiresWithdrawalForm) || ' ',
        invoiceDate:  this.datepipe.transform(this.odsValue.invoiceDate,'dd/MM/yyyy') || ' ',
        warrantyExtensionDate:  this.validateValueNullOrEmpty(this.odsValue.warrantyExtensionDate) || ' ',
        enterWithAccessories: enterWithAccesories_,
        accessoriesEntered: accessoriesEntered_ !== undefined ? accessoriesEntered_.slice(0,2): ' ',
        equipmentType:  this.validateValueNullOrEmpty(this.odsValue.equipmentType) || ' ',
        warrantyReplacement: this.transformBoolean(this.odsValue.warrantyReplacement) || ' ',
        repairState: repairState_,
        odsDate: this.validateValueNullOrEmpty(this.odsValue.odsDate),
        entryPerWarranty: this.validateValueNullOrEmpty(entryPerWarranty_),
        processedWarrantySameFailure: this.transformBoolean(this.odsValue.processedWarrantySameFailure) || ' ',
        repairEquipmentWithCost: this.transformBoolean(this.odsValue.repairEquipmentWithCost) || ' ',
        warrantyAppliesCompensation: this.transformBoolean(this.odsValue.warrantyAppliesCompensation) ||  ' ',
        customerDeliversEquipmentCAV: this.transformBoolean(this.odsValue.customerDeliversEquipmentCAV) || ' ',
        equipmentImpactsBrokenScreen: this.validateValueNullOrEmpty(this.odsValue.equipmentImpactsBrokenScreen),
        equipmentWithoutLabelSerial: this.validateValueNullOrEmpty(this.odsValue.equipmentWithoutLabelSerial),
        commentsCosmeticReviewStatus: this.validateValueNullOrEmpty(this.odsValue.commentsCosmeticReviewStatus),
        totalValueRepair: new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(totalValueR_)),
        clientReturnEquipmentLoan: this.transformBoolean(this.odsValue.clientReturnEquipmentLoan),
        reviewEquipmentLoanWasApproved: this.transformBoolean(this.odsValue.reviewEquipmentLoanWasApproved),
        descriptionAccessoriesEnterWarranty: this.validateValueNullOrEmpty(this.odsValue.descriptionAccessoriesEnterWarranty),
        law1480Applies: this.transformBoolean(this.odsValue.law1480Applies) || ' ',
        applyEquipmentChange: this.transformBoolean(this.odsValue.applyEquipmentChange) || ' ',
        moneyBackApplies: this.transformBoolean(this.odsValue.moneyBackApplies) || ' ',
        moneyRefundMade: this.transformBoolean(this.odsValue.moneyRefundMade) || ' ',
        repairedBy: this.validateValueNullOrEmpty(this.odsValue.repairedBy),
        faultFixedByBarTechnician: this.transformBoolean(this.odsValue.faultFixedByBarTechnician) || ' ',
        clientSatisfiedBarTechnicianSolution: this.transformBoolean(this.odsValue.clientSatisfiedBarTechnicianSolution) || ' ',
        customerDisagreementDetails: this.validateValueNullOrEmpty(this.odsValue.customerDisagreementDetails),        
        idUserDiagnosis: this.validateValueNullOrEmpty(this.odsValue.idUserDiagnosis),
        idTechnicalDiagnosis: this.validateValueNullOrEmpty(this.odsValue.idTechnicalDiagnosis),
        diagnosticObservations: this.validateValueNullOrEmpty(this.odsValue.diagnosticObservations),
        paymentMethod: this.validateValueNullOrEmpty(this.odsValue.paymentMethod),
        paymentConcept: this.validateValueNullOrEmpty(this.odsValue.paymentConcept),
        clientNotReceiveEquipment: this.validateValueNullOrEmpty(this.odsValue.clientNotReceiveEquipment),
        equipmentUnderWarranty: this.validateValueNullOrEmpty(this.odsValue.equipmentUnderWarranty),
        equipmentPresentedRealFault: this.validateValueNullOrEmpty(this.odsValue.equipmentPresentedRealFault),
        firstContactDate: this.validateValueNullOrEmpty(this.odsValue.firstContactDate),
        faultReported: this.validateValueNullOrEmpty(this.odsValue.faultReported),
        equipmentEntryDate: this.datepipe.transform(this.odsValue.equipmentEntryDate,'dd/MM/yyyy') || ' ',
        // equipmentOnLoan Data
        equipmentOnLoan_imei: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.imei),
        equipmentOnLoan_serial: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.serial),
        equipmentOnLoan_min: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.min),
        equipmentOnLoan_brand:  this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.brand),
        equipmentOnLoan_model: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.model),
        equipmentOnLoan_color: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.color),
        equipmentOnLoan_screen: this.validateValueNullOrEmpty(screenP_),
        equipmentOnLoan_equipmentCover: equipmentCover_,
        equipmentOnLoan_keyboard: this.validateValueNullOrEmpty(keyboardP_),
        equipmentOnLoan_connectors: this.validateValueNullOrEmpty(connectorsP_),
        equipmentOnLoan_humidityReader : humidityReader_,
        equipmentOnLoan_battery: this.validateValueNullOrEmpty(batteryP_),
        equipmentOnLoan_batteryCover: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.batteryCover),
        equipmentOnLoan_case : caseEquipment_,
        equipmentOnLoan_charger: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.charger),
        equipmentOnLoan_memoryCard: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.memoryCard),
        equipmentOnLoan_freehands: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.freehands),
        equipmentOnLoan_viewfinder: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.viewfinder),
        equipmentOnLoan_other: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.other),
        equipmentOnLoan_commentsIF: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.commentsIF),
        equipmentOnLoan_observations: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.observations),
        equipmentOnLoan_inspect: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.inspect),
        equipmentOnLoan_cosmeticReviewApproved: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.cosmeticReviewApproved),
        equipmentOnLoan_speakers: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.speakers),      
        equipmentOnLoan_cpu: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.cpu),      
        equipmentOnLoan_mouse: this.validateValueNullOrEmpty(this.odsValue.equipmentOnLoan?.mouse),
        // Final Data
        imageHeader: odsImage || ' ',   
        date : this.datepipe.transform(new Date(), 'dd/MM/yyyy'),
        hour: this.datepipe.transform(new Date(), 'h:mm a'), 
        docsEIF: this.validateValueNullOrEmpty(docsEIF_), 
        docsDYR: this.validateValueNullOrEmpty(docsDYR_),    
        tdHeight: '0',    
        documentName: this.validateValueNullOrEmpty(this.odsValue.idOds)
        // buyDate: this.validateValueNullOrEmpty(this.odsValue.buyDate),
      },
      idTemplate: environment.idODSTemplate      
    };
    console.log('PDF ODSTemplate',JSON.stringify(this.odsTemplate));
    return this.odsTemplate;
  }


  public GetTemplateNonCompliance(): ODSTemplate {
    this.listWarranty = this.warrantyService.GetListWarranty()
    this.odsTemplate = {
      idTemplate: environment.idNonComplianceTemplate,
      data: {
        name: this.returnitemsWarrante('TSC').find(tsc => tsc.id === this.odsValue.tsc)?.description?.toUpperCase() || 'CLARO',
        days: this.warrantyService.getBreachTimeDays,
        ods: this.validateValueNullOrEmpty(this.odsValue.idOds),
        day : this.datepipe.transform(new Date(), 'dd'),
        month : this.getMonthName(this.datepipe.transform(new Date(), 'MM')),
        year : this.datepipe.transform(new Date(), 'yyyy'),
        cavName: this.validateValueNullOrEmpty(sessionStorage.getItem('nameCav')?.toUpperCase().replace('CAV ','')),
        // datos del equipo
        type: this.odsValue.equipment?.imei ? 'IMEI' : 'Serial',
        brand: this.validateValueNullOrEmpty(this.odsValue.equipment?.brand),
        model: this.validateValueNullOrEmpty(this.odsValue.equipment?.model),
        imei: this.odsValue.equipment?.imei ? this.odsValue.equipment.imei : this.odsValue.equipment?.serial
      }
    };
    return this.odsTemplate;
  }

  private getMonthName(monthNumber: string): string {
    const months = [monthNumber, 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre' ]
    return months[Number(monthNumber)].toUpperCase()
  }

}
