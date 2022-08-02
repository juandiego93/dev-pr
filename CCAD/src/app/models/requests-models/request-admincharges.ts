
export interface HeaderRequest {
  idBusinessTransaction: string;
  idApplication: string;
  target: string;
  userApplication: string;
  password: string;
  startDate: Date;
  ipApplication: string;
  idESBTransaction: string;
  userSession: string;
  channel: string;
  additionalNode: string;
}

export interface ProductCategory {
  name: string;
  value: string;
}

export interface ContextAttribute {
  contextName: string;
  contextValue: string;
}

export class RequestAdminCharges {
  headerRequest: HeaderRequest;
  productCategory: ProductCategory[];
  contextAttributes: ContextAttribute[];
}
