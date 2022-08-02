export interface ResponseChargesNotification {
  isValid: boolean;
  message: string;
}

export interface ResponseStatus {
  code: string;
  message: string;
  status: string;
}

export interface DataChargesNotification {
  responseStatus: ResponseStatus;
  feeSeq: string;
}
