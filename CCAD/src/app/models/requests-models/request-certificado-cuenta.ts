
export class RequestCertificadoCuenta {
  headerRequest: HeaderRequest;
  subscriberNumber: string;
}

class HeaderRequest {
  idBusinessTransaction: string;
  idApplication: string;
  target: string;
  startDate: string;
  channel: string;
}
