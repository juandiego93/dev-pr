import { TypeDocument } from './documentType';

export interface Invoice {
  documentType: string
  documentNumber:string
  name:string
  lastName:string
  subject: string
  cavName:string
  cavCity: string
  totalToPay: string
}

export interface InvoiceModalInfo {
  invoice: Invoice,
  documentTypes: TypeDocument[]
}


export interface CashPaymentValidation{
  generatePayment: boolean;
  cashInvoice: CashPayInvoice;
}
export interface CashPayInvoice{
  reference: number;
  shortDocType: any;
  documentType: any;
  documentNumber: any;
  name: string;
  surname: string;
  account: string;
  concept: string;
  userId: any;
  orderType: string;
  productId: any;
  productName: string;
  nameCav: string;
  cityCav: string;
  paymentValue: any;
  email?: string;
}
