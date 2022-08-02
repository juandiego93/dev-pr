export class RequestFinancingsSearch {
  headerRequest: HeaderrequestFS;
  accountNumber: string;
  returnActive: string;
}

export class HeaderrequestFS {
  idBusinessTransaction: string;
  idApplication: string;
  target: string;
  startDate: Date;
  channel: string;
}
