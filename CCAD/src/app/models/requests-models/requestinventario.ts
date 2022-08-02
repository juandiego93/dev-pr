export class RequestInventario {
  headerRequest: HeaderRequestInventario;
  imei: string;
}
export class HeaderRequestInventario {
  transactionId: string;
  system: string;
  target: string;
  user: string;
  password: string;
  requestDate: string;
  ipApplication: string;
  traceabilityId: string;
}

