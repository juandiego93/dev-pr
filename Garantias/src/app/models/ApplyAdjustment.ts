import { HeaderRequest } from "./headerRequest";

export interface IApplyAdjustment
  {
    headerRequest: HeaderRequest,
    adjustmentType : string;
    customerIdSource: string;
    customerIdDestination : string;
    accountingAccount : string;
    amount : string;
    iva : string;
    idInvoice : string;
    comment : string;
    jobCost : string;
    user : string;
  }

