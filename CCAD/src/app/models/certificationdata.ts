import { DynamicDocAccountCertification } from "./requests-models/request-dynamc-doc-cert-cuenta";
import { MensajesAplicacion } from "./response-model/ResponseParameter";

export class CertificationData {
  typeDocument: string;
  idTypeDoc: number;
  numberDocument: string;
  idTurn: string;
  biHeaderId: string;
  channel: string;
  channelTypeCode: number;
  min: string;
  URLReturn: string;
  idUser: string;
  account: string;
  source: string;
  shortDocumentType: string;
  serviceId: string;
  guid: string;
  boolSetPresencial: boolean;
  transactionID: string;
  idAdress: string;
  fullTypeDocument: string;
  serviceNumber: string;
  valuePayment: any;
  userClaro: string;
  currentAddress: string;
  status: string;
  idService: string;
  documentName: string;
  referenceNumber: string;
  Name: string;
  Surname: string;
  tchannel: number;
  documentNumber: string;
  documentType: number;
  documentTypeCode: string;
  idFlow: string;
  nextMethod: string;
  dynDocCertCuenta: DynamicDocAccountCertification;
  print: boolean;
  notificationMode: string;
  typeNotification: string;
  messages: MensajesAplicacion;
  certBase64: string;
  ExternalURLReturn: string;
}

export class Step {
  steps: string[] = [
    'END_ATTENTION',
    'KB_CASE',
    'RL_SATISFIED',
    'M_EMAIL',
    'M_CERTIFICATE_PRINT',
    'PRINT',
    'KB_NO_COST',
    'RL_CONDITIONS',
    'KB_PRINT',
    'RL_EMAIL',
    'M_CERTIFICATE'
  ]
}
