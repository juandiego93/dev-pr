import { InternalCaseResponse, Warranty, WarrantyItem } from "./case";
import { InternalCase } from "./internalCase";
import { StepOds, Ods, OdsStepTable, ODSResponse } from './ods';
import { Notification_Preference } from './notification';
import { Cav } from './cav';
import { CashPaymentValidation } from "./invoice";
import { SuccessFactorInfo } from './successFactor';
import { Financing } from "./validatefinancing";

export class Guarantee {
  biHeaderId: string;
  idTurn: string;
  tchannel: number;
  min: string;
  URLReturn: string;
  idUser: string;
  account: string;
  source: string;
  documentNumber: string;
  documentType: string;
  documentTypeCode: string;
  type:any;
  nameProfile: string;
  submitted= false;
  loadSession = false;
  idFlow: string;
  presencialchannel: boolean;
  cstFulfilled: boolean;
  storageChargeApplies: boolean;
  hasEquipmentOnLoan: boolean;
  showCaseQuery: boolean;
  showCaseTable: boolean;
  codeCav: any;
  guid: string;
  nameCaseStateSelected:string;
  internalCaseResponses: InternalCaseResponse[];
  selectedCase: Ods;
  internalCase = new InternalCase;
  nextMethod: string;
  caseMemorandumMethod: string;
  idAddress: string;
  odsMethod:string;
  idBizInteraction: string;
  existInventory: boolean;
  loanAmount: number;
  costStorageEquipment: number;
  costLoanEquipment: number;
  totalcostLoanEquipment: number;
  adjustment: {
    charge: string
    remark: string
  };
  numberDays: number;
  odsOfCase: StepOds;
  notificationPreference: Notification_Preference;
  email: string;
  phoneNumber: string;
  cavInfo: Cav;
  name: string;
  surname: string;
  cashPaymentValidation:CashPaymentValidation;
  urlPayCash: any;
  listWarranty: Warranty[];
  documentNumberAdvisor: string;
  user: string;
  successFactorInfo: SuccessFactorInfo;
  namesUploadedFiles:string [];
  showDocumentalManager:boolean;
  allowUpload: boolean;
  financingInfo: Financing;
  financedProduct:boolean;
  positiveBalance: boolean;
  consultODS: boolean;
  inBadCondition: boolean;
  hasToPay: boolean;
  originStorer: boolean;
  repairedWithCost: boolean;
  odsResponses: OdsStepTable[];
  odsResponsews: ODSResponse;
  enterWithAccessories?: any;
  productOfferingId: any;
  typePayment: any;
  storagePaymentDone: boolean;
  customerId: string;
  boolSourceOriginCurrentOperation: boolean;
  LoanPaymentDone:boolean;
  reasonId:string;
  strXmlPaymentService: string;
  numberStep: number;
  //#region Valores para método UpdateCaseManual- Pasos
  isCloseCase: boolean;
  updateODS: boolean;
  //#endregion
  //#region Valores para método OpenComponentCash- Pasos
  urlComponent: any
  //#endregion
  //#region Valores para método ValidatePaymentCashRule- Pasos
  paymentMade
  //#endregion
  //#region Valores para método CasePaymentNotMade- Pasos
  isCloseCasePayment: boolean;
  updateODSPayment: boolean;
  //#endregion
  //#region Valores para método CosmeticNoveltiesRule- Pasos
  originByFail?:boolean;
  //#endregion
  odsBase64: string;
  // #Variable del memorando de incumplimiento true = Incumplió
  showMemorandumFormat: boolean;
}
