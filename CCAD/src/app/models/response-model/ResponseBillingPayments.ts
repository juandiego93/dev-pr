
export class ResponseBillingPayments {
  isValid: boolean;
  message: string;
}

export class ModelResponseBillingPayment {
  responseStatus: ResponseStatus;
  accounts: Array<Accounts>;
}

class ResponseStatus {
  code: string;
  message: string;
  status: string;
}

class Accounts {
  billingAccountCode: string;
  billingAccountId: string;
  id: string;
  number: string;
  payment: Array<any>;
}
