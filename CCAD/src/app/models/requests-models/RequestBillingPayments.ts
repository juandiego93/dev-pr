
export class RequestBillingPayments {
  headerGetBilling: HeaderRequest;
  accountNumber: string; // "93000000098471",
  paymentStatus: string; // "3" ,
  paymentDateFrom: string; // "2019-05-21",
  paymentDateUntil: string; // "2020-07-27",
  searchLimit: string; // "10"
}

class HeaderRequest {
  idBusinessTransaction: string;
  idApplication: string;
  target: string;
  startDate: string;
  channel: string;
  userApplication: string;
  password: string;
  ipApplication: string;
  idESBTransaction: string;
  userSession: string;
  additionalNode: string;
}
