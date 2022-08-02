import { HeaderRequest } from './headerRequest';

export interface BillingCycleRequest {
  headerRequest: HeaderRequest;
  pivotDate: string;
  idCycle: string;
  description: string;
  itemsNumber: string;
}

export interface BillingCycleResponse {
  headerResponse: HeaderResponse
  response: Array<Response>
  statusResponse: StatusResponse
}

interface HeaderResponse {
  responseDate: string;
  traceabilityId: string;
}

interface Response {
  id: string
  desc: string
  lastRunDate: string
  bchRunDate: string
  approved: string
  intervalType: string
  length: number
}

interface StatusResponse {
  code: string;
  message: string;
  status: string;
}
