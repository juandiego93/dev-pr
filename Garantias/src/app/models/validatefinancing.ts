export interface Financing {
  financingCode:               string;
  financingId:                 string;
  creationDate:                Date;
  username:                    string;
  accountNumber:               TNumber;
  contractNumber:              TNumber;
  billCycle:                   string;
  salesNetAmount:              string;
  equipmentRef:                string;
  equipmentRef2:               string;
  brand:                       string;
  model:                       string;
  status:                      string;
  debitState:                  string;
  chargeBillingAccount:        ChargeBillingAccount;
}

export interface TNumber {
  _id: string;
}

export interface ChargeBillingAccount {
  _id:    string;
  __text: string;
}
