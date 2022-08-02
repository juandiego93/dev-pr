export interface RequestUpdateData{
  guid: string;
  nameData: string;
  newValue: string;
}

export interface ResponseUpdateData{
  State: string;
  Message: string;
  ObjType: any;
}
