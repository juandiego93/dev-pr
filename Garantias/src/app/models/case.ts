import { HeaderRequest } from "./headerRequest";
import { StepOds } from "./ods";

export class GetCaseRequest {
  headerRequest: HeaderRequest;
  documentType?: number;
  documentNumber?: string;
  imei?: string;
  serial?: string;
  idOds?: string;
  state?: any;
  idInternalCase?: number;
}


export interface Case {
  cun: string;
  fechaRadicacion: number;
  fechaRespuesta: number;
  estado: string;
  caseState: string;
  tipoCaso: string;
  nr: string;
  descripcion: string;
  idDocumentoRespuesta: string;
  idInternalcase: string;
  state: string;
  observations: string;
  listCaseStates: WarrantyItem[];
}

export interface GetCaseResponse {
  //cases: Case[];
  internalCaseResponse: InternalCaseResponse[]
  status: string;
  message: string;
  isValid: boolean
}
export class UpdateCase{
  scalation: boolean;
  nr: string;
  status: string;
  comment : string;
  //nuevos campos
  idInternalCase: string;
  updateDate: any;
  caseState: any;
  paidStorage: boolean;
  hasPriority: boolean;
  internalCaseResponse: InternalCaseResponse
}
export interface Warranty{
  nameList: string;
  value: WarrantyItem[];
}
export interface WarrantyItem{
  id: number;
  description: string;
  name: string;
  value: boolean;
  disable: boolean;
}
export interface StateCase {
  id: number;
  description: string;
  name: string;
  value: boolean;
  disable: boolean;

}

export interface InternalCaseResponse {
  headerRequest: HeaderRequest;
  typing: number;
  priority: number;
  idOds: null | string;
  idInternalCase: number;
  client: Client;
  equipment: Equipment;
  equipmentOnLoan: boolean;
  period: number;
  diagnosis: string;
  entryDate: Date;
  entryHour: string;
  state: number;
  observations: string;
  tsc: number;
  user: string;
  repairDate: Date | null;
  newEquipment: null;
  paidStorage: boolean;
  hasPriority: boolean;
  listCaseStates: Array<WarrantyItem>
  odsOfCase: StepOds;
  daysCurrentState: number;
  timesEnteredWarranty: number;
  paymentNotMade : "STORAGE" | "EQUIPMENT";
  stock: boolean;
  madeCashPayment: boolean;
  breachOfTime: boolean;
  repairEquipmentWithCost: boolean;
  repairState: number;
  equipChange: boolean;
  law1480Applies : boolean;
  enterWithAccessories: boolean;
  failure?: string;
  warrantyReplacement?: boolean;
  customerDeliversEquipmentCAV?: boolean;
  faultReported?: number;
  condition?: string;
  observationsD?: string;
}

export interface Client {
  documentType: number;
  documentNumber: string;
  name: string;
  phone: number;
  email: string;
  city: string;
  department: string;
  address: string;
}

export interface Equipment {
  imei: null | string;
  serial: string;
  min: number | null;
  brand: string;
  model: string;
  color: string;
  description: string;
}

