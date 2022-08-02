export interface ResponseAdminCharges {
  isValid: boolean;
  message: string;
}

export interface ResponseStatus {
  code: string;
  message: string;
  status: string;
}

export interface Units {
  code: string;
  name: string;
}

export interface Price {
  amount: number;
  units: Units;
}

export interface Version2 {
  markup: number;
  price: Price;
  id: string;
  plaId: string;
  popType: string;
  frequency: string;
}

export interface ProductOfferingPrice {
  versions: Version2[];
  id: string;
}

export interface Version {
  productOfferingPrices: ProductOfferingPrice[];
  id: string;
}

export interface Content {
  versions: Version[];
  id: string;
  href: string;
}

export interface DataAdminCharges {
  responseStatus: ResponseStatus;
  content: Content[];
}

