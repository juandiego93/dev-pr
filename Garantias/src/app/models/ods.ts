import { environment } from '../../environments/environment';
import { HeaderRequest } from './headerRequest';
export class ODSRequest {
  headerRequest: HeaderRequest;
  documentType?: any;
  documentNumber?: string;
  imei?: string;
  serial?: string;
  idOds?: any;
  idInternalcase?: any;
  tsc?: any;
  state?: any;
  ods?: Ods;
}

export interface ODSResponse {
  isValid: boolean,
  message: string,
  odsResponse: Ods[],
}
export interface OdsStepTable{
  client?: Client;
  equipment?: Equipment;
  idOds?: string; // numero que identifica la ods
  idInternalcase?: number;
  typing?:number;
  state?: number;
  entryDate?: string;
  entryHour?: string;
  daysCurrentState?:number;
  tsc?: number;
  user?: string;
  equipLoan?: boolean;
  equipLoanI?: boolean;
  failure?: string;
  warrantyReplacement?: boolean;
  customerDeliversEquipmentCAV?: boolean;
  faultReported?: number;
  condition?: string;
  observationsD?: string;
  period?: number;
  equipmentOnLoan?: Equipment;
  repairEquipmentWithCost: boolean;
  repairState?: number;
  law1480Applies?:boolean;
  equipChange?: boolean;
  modificationStateDate?:string;
}
export interface Ods {
  idOds?: string; // numero que identifica la ods
  idInternalCase?: number;
  idInternalcase?: number;
  idEquipment?: number;
  client?: Client;
  equipment?: Equipment;
  equipmentOnLoan?: Equipment;
  period?: number;
  diagnosis?: string;
  entryDate?: string;
  entryHour?: string;
  state?: number;
  observations?: string;
  tsc?: number;
  user?: string;
  service?: string;
  doa?: boolean;
  equipLoan?: boolean;
  loanType?: string;
  buyDate?: string;
  attentionCenter?: string;
  lineSuspension?: boolean;
  distributor?: string;
  failure?: string;
  condition?: string;
  comments?: string;
  lineSuspensionI?: boolean;
  equipLoanI?: boolean;
  detail?: string;
  delivery?: number;
  case?: number;
  keyboard?: number;
  connectors?: number;
  charger?: number;
  memoryCard?: number;
  screen?: number;
  battery?: number;
  batteryCover?: number;
  freehands?: number;
  viewfinder?: number;
  other?: string;
  commentsIF?: string;
  request?: string;
  inspect?: string;
  responserule?: boolean;
  sympton?: string;
  repair?: string;
  reviewed?: string;
  reviewDate?: string;
  repairDate?: string;
  newEquipment?: Equipment;
  observationsD?: string;
  termsOfservice?: string;
  consultation?: string;
  part?: Array<Part>;
  qualitystate?: Qualitystate[];
  responseLaw?: any;
  requiresWithdrawalForm?: any;
  invoiceDate?: any;
  warrantyExtensionDate?: any;
  enterWithAccessories?: any;
  accessoriesEntered?: AccessoriesEntered[];
  equipmentType?: any;
  entryPerWarranty?: any;
  processedWarrantySameFailure?: any;
  repairEquipmentWithCost?: any;
  warrantyAppliesCompensation?: any;
  customerDeliversEquipmentCAV?: any;
  equipmentImpactsBrokenScreen?:boolean;
  equipmentWithoutLabelSerial?:boolean;
  commentsCosmeticReviewStatus?: string;
  equipmentDelivery?: any;
  warrantyReplacement?: any;
  cosmeticReviewApproved?: any;
  repairStateD?: any;
  typing?:number;
  daysCurrentState?:number;
  paymentNotMade?:string
  repairState?: any;
  equipChange?: boolean;
  clientReturnEquipmentLoan?:boolean;
  reviewEquipmentLoanWasApproved?:boolean;
  descriptionAccessoriesEnterWarranty?: string;
  law1480Applies?: boolean;
  clientNotReceiveEquipment?: boolean;
  priority?: number;
  faultReported?: any;
  totalValueRepair?: any;
  repairedBy?:any;
  moneyBackApplies?: boolean;
  moneyRefundMade? :boolean;
  applyEquipmentChange?: boolean;
  faultFixedByBarTechnician?: boolean;
  clientSatisfiedBarTechnicianSolution?: boolean;
  customerDisagreementDetails?: any;
  idUserDiagnosis?: any;
  idTechnicalDiagnosis? : any;
  diagnosticObservations? : any;
  paymentMethod?:number;
  paymentConcept?:any;
  equipmentEntryDate?: any;
  equipmentUnderWarranty?:boolean;
  equipmentPresentedRealFault?:any;
  firstContactDate?:string;
  odsDate?:string;
  //Valor del check de memorando ConsultCaseAsync Método
  breachOfTime?: boolean;
  receiveReturnedProduct?: boolean;
  //Valor del stock 01 ConsultCaseAsync Método
  stock?: boolean;
  //Valor del campo (Pago realizado por el cliente) EQUIPMENT
  madeCashPayment?: boolean;
  //Valor del campo (Pago realizado por el cliente) STORAGE
  paidStorage?: boolean;
  modificationStateDate?: string;
}

export interface Client {
  documentType?: number;
  documentNumber?: string;
  name?: string;
  phone?: number;
  email?: string;
  city?: string;
  department?: string;
  address?: string;
  account?: string;
}

export interface Equipment {
  imei?: string;
  serial?: string;
  min?: number;
  brand?: string;
  model?: string;
  color?: string;
  description?: string;
  keyboard?: number;
  connectors?: number;
  screen?: number;
  battery?: number;
  batteryCover?: number;
  humidityReader? : any;
  equipmentCover?: number;
  case?: any;
  speakers?: any;
  cpu?: any;
  mouse?:any;
  other?: any;
  observations?: any;
  commentsIF?: any;
  charger?: number;
  memoryCard?: number;
  freehands?: number;
  viewfinder?: number;
  sap?:any;
  inspect?:string;
  cosmeticReviewApproved?:boolean;
}

export interface Part {
  description?: string;
  amount?: number;
  value?: number;
  totalvalue?: number;
}

export interface Qualitystate {
  idQualityState?: number;
}


export class ODSValues {
  documentNumber= false;
  imei = false;
  serial = false;
  idOds = false;
}

export class ODSTemplate{
  idTemplate: number; // Identificador único de la plantilla.
  data: any; // Objeto correspondiente a las propiedades requeridas para la generación del documento.
}


export interface StepOds{
  idOds?: string; // numero que identifica la ods
  imei?: string; // imei asociado a ods
  entryDate?: string; //fecha de ingreso
  equipLoan?: boolean; //equipo en prestamo?
  equipLoanI?: boolean; //equipo en prestamo?
  documentType?: any;
  documentNumber?: string;
  updateODS?: boolean;
  repairEquipmentWithCost?:boolean;
  repairState?: any;
  equipChange?: boolean;
  law1480Applies?: boolean;
  doa?: boolean;
  state: any;
  enterWithAccessories?: any;
  accessoriesEntered?: AccessoriesEntered[];
  serial?: string;
  period?: number;
  failure?: string;
  warrantyReplacement?: boolean;
  customerDeliversEquipmentCAV?: boolean;
  faultReported?: number;
  condition?: string;
  observationsD?: string;
  equipment?: EquipmentStepOds;
  equipmentOnLoan?: EquipmentStepOds;
}

export interface EquipmentStepOds {
  keyboard?:number;
  connectors?:number;
  screen?:number;
  battery?:number;
  batteryCover?:number;
  case?:number;
  charger?:number;
  memoryCard?:number;
  freehands?:number;
  viewfinder?:number;
  speakers?:number;
  cpu?:number;
  mouse?:number;
  brand?: string;
  model?: string;
  serial?: string;
  imei?: string;
  min?: number;
}

export enum FormatTemplate {
  ODSFormat = environment.idODSTemplate,
  NonComplianceFormat = environment.idNonComplianceTemplate
}

export enum ODSStates {
  Created = "CR", // Creado
  InRepair = "ER", // En reparación
  Repared = "R", // Reparado
  Closed = "CL", // Cerrado
  ReceivedHome = "RD", // Recibido en domicilio
  ReceivedOriginPoint = "RPO", // Recibido en punto de origen
  RefundMoney = "DD", // Devolución de dinero
  EquipmentChange = "CE", // Cambio de equipo
  SentToSource = "EPO", // Enviado a punto de origen
  MemorandumAcceptance = "M", // Memorando de aceptación por incumplimiento en tiempos
  Asigned = "AS", // Asignado
  PaymentNotMade = "PNR", // Pago no realizado por el cliente
  ClientNotReceiveEquipment = "NR", // Cliente no recibe equipo
  Stored = "AL", // Almacenado
  Diagnosis = "D", // Diagnóstico
  SentToHome = "ED", // Enviado a domicilio
  ReparedWithCost = "RC", // Reparación con costo
  ReparedWithNoCost="RSC", // Reparación sin costo
  ReturnToStore="DA", // Devuelto al almacén
  WarrantyNoCover="NG", // No cubre la garantía
  Irreparable="I", // Irreparable
  NotifySupplier="NP" // Notificar al proveedor
}

export enum RepairState {
  ReparedWithNoCost = 1,
  ReparedWithCost = 2,
  Irreparable = 3
}

export interface UploadedFileResponse {
  isValid: boolean;
  message: string;
  uploadedFileResponse: UploadedFileResponseItem[];
}
export interface UploadedFileResponseItem {
  name: any;
  type: any;
  base64Data: any;
  fileSection: string;
  fileSectionID: number;
}
export interface AccessoriesEntered {
  idAccessoriesEntered: number;
}
export enum TypePayment{
  StoragePayment = 'bodegaje',
  LoanPayment = 'préstamo'
}

export enum ModalityCav{
  Presencial ='Presencial',
  Virtual = 'Virtual'
}
