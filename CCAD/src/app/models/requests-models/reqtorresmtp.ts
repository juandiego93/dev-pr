export interface Reqtorresmtp {

  headerRequest: HeaderSMTP;
  message: string;
}

export interface HeaderSMTP {
  transactionId: string;
  system: string;
  user: string;
  password: string;
  requestDate: string;
  ipApplication: string;
  traceabilityId: string;
}
export interface RootObjectSMTP {
  pushType: string;
  typeCostumer: string;
  messageBox: MessageBox[];
  profileId: string[];
  communicationType: string[];
  communicationOrigin: string;
  deliveryReceipts: string;
  contentType: string;
  messageContent: string;
  attach: Attach[];
  idMessage: string;
  subject: string;
}

export interface MessageBox {
  messageChannel: string;
  messageBox: MessageBox2[];
}

export interface MessageBox2 {
  customerId: string;
  customerBox: string;
}

export interface Attach {
  name: string;
  type: string;
  encode: string;
  content: string;
}

