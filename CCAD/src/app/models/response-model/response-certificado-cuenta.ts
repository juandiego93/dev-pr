export class ResponseCertificadoCuenta {
  isValid: boolean;
  data: [ResponseStatus, CustomerParent, AccountParent];

}

interface ResponseStatus {
  code: string;
  message: string;
  status: string;
}

interface CustomerParent {
  customer: Customer;
}

interface Customer {
  name: string;
  lastname: string;
  identificationNumber: string;
  identificationType: string;
}

interface AccountParent {
  accounts: AccountChild;
}

interface AccountChild {
  account: Account;
}

interface Account {
  number: string;
  currentArrangement: CurrentArrangement;
  TPR: TPR;
}

interface CurrentArrangement {
  '@validFrom': string;
  id: string;
  paymentMethod: string;
}

interface TPR {
  id: string;
  previousBalance: string;
  currentBalance: string;
  lastBilledDate?: any;
  SPR: SPR;
}

interface SPR {
  id: string;
  billingAcountId: string;
  billingAcountCode: string;
  previousBalance?: any;
  currentBalance: string;
  collectionInd: string;
  collection: any;
}
