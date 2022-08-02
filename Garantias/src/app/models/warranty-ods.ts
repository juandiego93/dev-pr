import { HeaderRequest } from "./headerRequest";

export interface WarrantyOds {
  headerRequest: HeaderRequest;
  idOds: string
  client: Client
  equipment: Equipment
  equipmentOnLoan?: EquipmentOnLoan
  period: number
  diagnosis?: string
  state: number
  entryDate?: string
  entryHour?: string
  tsc: number
  user: string
  service?: string
  doa?: boolean
  equipLoan?: boolean
  loanType?: string
  attentionCenter?: string
  lineSuspension?: boolean
  distributor?: string
  failure: string
  condition: string
  comments?: string
  lineSuspensionI?: boolean
  equipLoanI?: boolean
  detail?: string
  delivery?: number
  sympton?: string
  repair?: string
  reviewed?: string
  reviewDate?: string
  repairDate?: string
  newEquipment?: NewEquipment
  observationsD: string
  termsOfservice?: string
  consultation?: string
  equipChange?: boolean
  part?: Array<Part>
  qualitystate?: Array<QualityState>
  responseLaw?: boolean
  requiresWithdrawalForm?: boolean
  invoiceDate?: string,
  enterWithAccessories: boolean
  accessoriesEntered?: Array<AccessoriesEntered>
  equipmentType?: boolean
  warrantyReplacement: boolean
  repairState?: boolean
  entryPerWarranty?: boolean
  processedWarrantySameFailure?: boolean
  repairEquipmentWithCost?: boolean
  warrantyAppliesCompensation?: boolean
  customerDeliversEquipmentCAV: boolean
  equipmentImpactsBrokenScreen?: boolean
  equipmentWithoutLabelSerial?: boolean
  commentsCosmeticReviewStatus?: string
  totalValueRepair?: boolean
  clientReturnEquipmentLoan?: boolean
  reviewEquipmentLoanWasApproved?: boolean
  descriptionAccessoriesEnterWarranty?: string
  law1480Applies?: boolean
  applyEquipmentChange?: boolean
  moneyBackApplies?: boolean
  moneyRefundMade?: boolean
  repairedBy?: string
  faultFixedByBarTechnician?: boolean
  clientSatisfiedBarTechnicianSolution?: boolean
  customerDisagreementDetails?: string
  idUserDiagnosis?: boolean
  idTechnicalDiagnosis?: boolean
  diagnosticObservations?: string
  paymentMethod?: number;
  paymentConcept?: string
  clientNotReceiveEquipment?: boolean
  equipmentUnderWarranty?: boolean
  equipmentPresentedRealFault?: boolean
  firstContactDate?: string
  faultReported?: number
  equipmentEntryDate?:string
  receiveReturnedProduct?: boolean;
}

interface Client {
  phone?: number
  email?:  string
  city?:  string
  department?:  string
  address?:  string
  account?:  string
}

interface Equipment {
  imei?: string
  serial?: string
  min?: number
  brand?: string
  model?: string
  color?: string
  keyboard?: number
  connectors?: number
  screen?: number
  battery?: number
  batteryCover?: number
  case?: number
  charger?: number
  memoryCard?: number
  freehands?: number
  viewfinder?: number
  other?: string
  commentsIF?: string
  observations?: string
  inspect?: string
  cosmeticReviewApproved?:boolean
  speakers?: number
  cpu?: number
  mouse?: number
}

interface EquipmentOnLoan {
  imei?: string
  brand?: string
  model?: string
  keyboard?: number
  connectors?: number
  screen?: number
  battery?: number
  humidityReader?: number
  equipmentCover?: number
  case?: number
}
export interface NewEquipment {
  imei?: string
  serial?: string
  brand: string
  model: string
  sap:any;
}

export interface Part {
  description?: string
  amount?: number
  value?: number
  totalvalue?: number
}
export interface QualityState {
  idQualityState?: number
}

interface AccessoriesEntered {
  idAccessoriesEntered?: number
}
