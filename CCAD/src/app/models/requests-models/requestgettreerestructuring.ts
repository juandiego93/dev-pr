export interface HeaderRequest {
  idBusinessTransaction: string;
  idApplication: string;
  target: string;
  startDate: Date;
  channel: string;
  userApplication: string;
  password: string;
  ipApplication: string;
  idESBTransaction: string;
  userSession: string;
  additionalNode: string;
}

export class RequestGetTreeRestructuring {
  headerRequest: HeaderRequest;
  PCODRTA: string;
  PCTASUS: string;
  PIDSUSC: string;
  PMSGRTA: string;
  CANAL: string;
}
