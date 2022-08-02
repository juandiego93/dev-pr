export class DynamicDocuments {
  Id: number;
  NameDoc: string;
  BodyDoc?: string;
  Active?: boolean;
}

export class RequestParameter {
  name:string;
}

export interface ResponseParameter {
  ID_PARAMETER: string;
  NAME_PARAMETER: string;
  VALUE_PARAMETER: string;
  DESCRIPTION_PARAMETER: string;
  TYPED: string;
}
