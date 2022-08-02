export class GenericResponse  {
  isValid: boolean;
  message: string;
}
export class fileRequest{
  headerRequest: any;
  file:any;
}
export interface CstPaymentResponse extends GenericResponse{
  data:Array<DataPayment>;
}
export interface DataPayment{
  typeService: number;
  concept: string;
  value: number;
}

export class CstVerifyPaymentRequest {
  headerRequest: any;
  codeODS:string;
  invoiceNumber:string;
}

export interface RpQuery{
  DN_NUM: string;
  CO_ID: string;
  TMCODE: string;
  PASSPORTNO: string;
  CUSTOMER_ID: string;
  CUSTCODE: string;
}

export interface EvalSource{
  source: string;
  opActual: boolean;
}


export class ResponseInvoice {
  SaldoAFavor: number;
  MetodoPago: string;
  NombreBanco: string;
  Invoices: Array<Invoice>;
}

export class Invoice {
  Factura: string;
  FechaFactura: string;
  FechaVencimiento: string;
  NombreBanco: string;
  NumeroReferencia: string;
  Tipo: string;
  Valor: number;
}
