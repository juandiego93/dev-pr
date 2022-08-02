export class RequestPresencialBizInteraction {
  presencialChannel: Boolean;
  idTurn: string;
  idEvent: number;
  description: string;
  externalTransactionId: string;
  interactionDirectionTypeCode: string;
  subject: string;
  channelTypeCode: number;
  accountCode:string;
  customerCode: string;
  categoryCode: number;
  subCategoryCode: number;
  voiceOfCustomerCode: number;
  closeInteractionCode: number;
  domainName: string;
  userSignum: string;
  reason: string;
  regardingObjectId: string;
  biHeaderId: string;
  executionDate: string;
  typeObjectInteraction: string;
  headerRequestBizInteraction: HeaderRequestBizInteraction;
  service : string;
  id: string;
  mapValues: {
    userName: string,
    userLocation: string,
    userNameLocation: string
  }
}

export class HeaderRequestBizInteraction {
  transactionId: string;
  system: string;
  user: string;
  password: string;
  requestDate: string;
  ipApplication: string;
  traceabilityId: string;
}

export class ResponseGetBizInteraction{
  headerResponse:string;
  isValid : boolean;
  message : string;
}


export enum ChannelTypeCodes {
  Presencial = 1,
  Telephone = 2,
  SelfService = 3
}
