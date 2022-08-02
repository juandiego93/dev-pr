export class RequestCustomerTransaction {
  idTurn: string;
  idFlow: string;
  typeDocument: string;
  numberDocument: string;
}

export class RequestCloseTransaction {
  guidTransaction: string;
  state: string;
}
