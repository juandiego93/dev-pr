export class InsertDdocNameRequest{
  DocumentNumber: string;
  DocName: string;
  DocDate = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString();
  IdFlow: number;
  IdDocumentType: number;
}

export interface InsertDdocNameResponse{
  isValid: boolean;
  message: string;
}
