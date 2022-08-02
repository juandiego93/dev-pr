export interface ResponseCustomerTransaction {
  Guid: string;
  StateTransaction: string;
}

export class RequestCustomerTransaction {
  idTurn: string;
  idFlow: string;
  typeDocument: string;
  numberDocument: string;
}
