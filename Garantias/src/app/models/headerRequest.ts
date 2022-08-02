export interface HeaderRequest {
  transactionId: string;
  system: string;
  target: string;
  user: string;
  password: string;
  requestDate: string;
  ipApplication: string;
  traceabilityId: string;
}

export const HEADER_REQUEST: HeaderRequest = {
  transactionId: "string",
  system: "string",
  target: "string",
  user: sessionStorage.getItem('idUser') ? sessionStorage.getItem('idUser') : "string",
  password: "string",
  requestDate: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
  ipApplication: "string",
  traceabilityId: "string"
}


