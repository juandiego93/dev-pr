export class Header {
  Username: string;
  Password: string;
}

export class RequestFinancingIntegrator {
  headerRequest: Header;
  NRO_DOCUMENTO: string;
  TIPO_DOCUMENTO: string;
  MIN: string;
}

export interface WsPaymentsEnquirity {
  endpoint: string;
  Xml: string;
}

export interface WsPostSale {
  endpoint: string;
  Xml: string;
}

export interface PaymentsProperties {
  WsPaymentsEnquirity: WsPaymentsEnquirity;
  WsPostSale: WsPostSale;
}
 export interface PaymentPCLMProperties{
  WsPLCM: WsPaymentsEnquirity;
 }
