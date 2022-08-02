export class ResponsegetInfoClient {
  message: string;
  isValid: string;
  description: string;
  documentNumber: string;
  documentType: string;
  firstName: string;
  firstSurname: string;
  email: string;
  principalAddress: string;
  dataOrigin: string;
  doNotEmail: boolean;
  doNotSMSInstantMessaging: boolean;
}

export interface ResponsegetInfoClientItem {
  isValid: string;
  description: string;
  documentNumber: string;
  documentType: string;
  firstName: string;
  firstSurname: string;
  email: string;
  principalAddress: string;
  dataOrigin: string;
  doNotEmail: string;
  doNotSMSInstantMessaging: string;
  lastModified: string;
}
