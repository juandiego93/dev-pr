export interface RequestShoppingCart {
  flow: string,
  flowType: string,
  process: string,
  customerID: string,
  channel: string,
  salesPersonProfile: string,
  salesPoint: string,
  returnPrices: string,
  attrs: ClientInfo,
  locationAttrs: ClientLocation
  validarHDC: string,
  billCycle: string,
};

export interface ClientInfo {
  FIRSTNAME: string,
  MIDDLENAME: string,
  LASTNAME: string,
  DOCID: string,
  TYPEDOC: string,
  EMAIL: string
}

export interface ClientLocation {
  DIRECCION: string,
  REGIONAL: string,
  CIUDAD: string,
  CITY_CODE: string,
  DISCTRICTO: string,
  ID: string,
  NUMBER: string,
  DANE: string,
  ESTRATO: string,
  TECHNOLOGY: string
}

export interface ResponseEntryPoint {
  redirect: boolean;
  idSesion: string;
  url: string;
}


export interface ResponseSCToken {
  ok: boolean;
  messagge: string;
  body: BodyReresponseSC;
}

export interface BodyReresponseSC {
  scID: string;
  quoteID?: any;
  sapDocument?: any;
  flow: string;
  status: string;
  appointments: any[];
  items: ItemSC[];
  blackListFinancedItems: any[];
  deliveryOrderId?: any;
  token: string;
  process: string;
  flowType: string;
}

export interface ItemSC {
  itemParentId: string;
  poIdMain: string;
  items: DetailItemSC[];
  contractId: string;
}

export interface DetailItemSC {
  itemID: string;
  poID: string;
  poName: string;
  codeMaterial: string;
  subType: string;
  serialItem?: any;
  action: string;
  appointmentId?: any;
  deliveryType: string;
  priceDetails: PriceDetail[];
  characteristics: Characteristic[];
  logisticCenter: string;
  associationType: string;
}

export interface Characteristic {
  name: string;
  value: string;
}

export interface PriceDetail {
  amount: number;
  characteristics: Characteristic[];
  frecuency: string;
  name: string;
  priceType: string;
  poID: string;
}

export interface RequestDeleteSC {
  scID: string;
  itemID: string;
  subType: string;
  returnPrices: boolean;
}

export interface SubmitRequestSC {
  scID: string;
  isLegacy: boolean;
}

export interface ResponseSCId {
  ok: boolean;
  messagge: string;
  body: BodyReresponseSC;
}

export interface DesactiveItemSCRequest{
  scID:string;
  itemID:string;
}