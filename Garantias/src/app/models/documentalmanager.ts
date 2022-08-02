export class RequestGestorDocumental {
  isValid: boolean;
  src: any;
  name: string;
  content: any;
}
export class FilesGD {
  name: string;
  content: any;
}
export class RequestBody {
  HeaderRequest: HeaderRequestUD;
  typeIdentification: string;
  numIdentification: string;
  customerCode: string;
  xdTipoDocumental: string;
  xdEmpresa: string;
  files: any[];
}
export interface Documentos {
  nombre: string;
}
export class RootObject {
  headerRequest: HeaderRequestUD;
  document: Document;
  file: any[];
}
export class HeaderRequestUD {
  transactionId: string;
  system: string;
  target: string;
  user: string;
  password: string;
  requestDate: string;
  ipApplication: string;
  traceabilityId: string;
}
export class Document {
  field: Field[];
}
export class Field {
  attributeName: string;
  attributeValue: string;
}
export class FileUD {
  name: string;
  content: string;
}

export interface ResponseGestorDocumental {
  isValid: boolean;
  message: string;
}
export interface MessageGD {
  isValid: boolean;
  documentStatus: documentStatus[];
}
export interface documentStatus {
  name: string;
  loaded: boolean;
  description: string;
  dDocName: string;
}

export interface RespUploadDoc {
  headerResponse: HeaderResponse;
  actionStatus: string;
  statusMessage: string;
  document: Document;
}

export interface HeaderResponse {
  responseDate: Date;
  traceabilityId: string;
}

export interface Document {
  field: Field[];
}

