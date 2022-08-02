import { HeaderRequest } from './headerRequest';

interface SapInventoryMessage {
    type: string;
    text: string;
}

export interface SapInventoryRequest {
  headerRequest: HeaderRequest
  imei: string
}

export interface SapInventoryResponse {
  distributorSocialName: string;
  taxIdentificationNumberType: string;
  taxIdentificationNumber: string;
  imeiNumber: string;
  clientName: string;
  taxIdentificationNumberType1: string;
  taxIdentificationNumber1: string;
  businessDocumentNumber: string;
  creationRecordDate: string;
  recordedTime: string;
  delivery: string;
  recordedTime1: string;
  businessDocumentNumber1: string;
  commercialDocumentDate: string;
  serialNumber: string;
  shortTextMaterial: string;
  materialNumber: string;
  materialType: string;
  clienteNumber1: string;
  town: string;
  invoiceType: string;
  center: string;
  salesOffice: string;
  amount: string;
  saleAddressPoint: string;
  text1: string;
  text2: string;
  text3: string;
  text4: string;
  text5: string;
  messageList: Array<SapInventoryMessage>;
  position: string;
}

export interface InventoryCreateOrderReturnRequest {
  headerRequest: HeaderRequest
  invoiceNumber: string
  sapPositionNumber: string
  fsPositionNumber: string
  serialNumber: string
}