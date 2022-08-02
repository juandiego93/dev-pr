export interface CatalogManagementRequest {
  body: Body;
  parameters: Parameters;
}

export interface Body {
  context: Context[];
}

export interface Parameters {
  id: string;
  idBusinessTransaction: string;
  idApplication: string;
  target: string;
  userApplication: string;
  startDate: string;
  additionalNode: string;
  channel: string;
  fields: string
}

export interface Context {
  name: string;
  value: string;
}

export interface CatalogManagementResponse {
  headerResponse: Headerresponse;
  getProductOfferingResponse: Getproductofferingresponse[];
}

export interface Headerresponse {
  endDate: Date;
  idESBTransaction: string;
  additionalNode: string;
  startDate: Date;
  idBusinessTransaction: string;
}

export interface Getproductofferingresponse {
  versions: Version[];
  id: string;
  href: string;
}

export interface Version {
  characteristics: Characteristic[];
  productOfferingPrices: Productofferingprice[];
  validFor: Validfor;
  description: string;
  specificationType: string;
  specificationSubtype: string;
  sharedIndicator: boolean;
  isComposite: boolean;
  sellIndicator: boolean;
  name: string;
  id: string;
  family: string;
  category: string;
}

export interface Validfor {
  startDateTime: Date;
}

export interface Characteristic {
  versions: Version1[];
  id: string;
}

export interface Version1 {
  displayValue: string;
  validFor: Validfor1;
  valueType: string;
  name: string;
  id: string;
  type: string;
  characteristicValues: Characteristicvalue[];
  value: string;
  properties: Property1[];
  minCardinality: number;
  isArray: boolean;
  maxCardinality: number;
}

export interface Validfor1 {
  startDateTime: Date;
}

export interface Characteristicvalue {
  displayValue: string;
  isDefault: boolean;
  validFor: Validfor2;
  valueType: string;
  value: string;
}

export interface Validfor2 {
  startDateTime: Date;
}

export interface Property1 {
  isSelected: boolean;
  value: string;
}

export interface Productofferingprice {
  versions: Version2[];
  id: string;
}

export interface Version2 {
  characteristics: Characteristic1[];
  markup: number;
  price: Price;
  percentage: number;
  name: string;
  id: string;
  plaId: string;
  popType: string;
  frequency: string;
}

export interface Price {
  amount: number;
  units: Units;
}

export interface Units {
  code: string;
  name: string;
}

export interface Characteristic1 {
  versions: Version3[];
  id: string;
}

export interface Version3 {
  displayValue: string;
  validFor: Validfor3;
  valueType: string;
  name: string;
  id: string;
  valueTypeSpecification: Valuetypespecification;
  value: string;
  characteristicValues: Characteristicvalue1[];
  properties: Property2[];
  type: string;
}

export interface Validfor3 {
  startDateTime: Date;
}

export interface Valuetypespecification {
  id: string;
}

export interface Characteristicvalue1 {
  displayValue: string;
  isDefault: boolean;
  validFor: Validfor4;
  valueType: string;
  value: string;
}

export interface Validfor4 {
  startDateTime: Date;
}

export interface Property2 {
  isSelected: boolean;
  value: string;
}

