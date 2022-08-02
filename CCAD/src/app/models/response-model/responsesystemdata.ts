export interface ResponseSystemData {
  ID_DATA: string;
  NAME_DATA: string;
  VALUE_DATA: string;
  PROCESS_FUNCTIONALITY_ID: string;
  CUSTOMER_TRANSACTION_ID: string;
  SYSTEM_DATE: string;

}

export interface ResponseUltimoPaso {
  ORDER_BY_FUNCTIONALITY: number;
  ACTION: string;
  CONTROLLER: string;
  lstData: LstData[];
}

export interface LstData {
  NAME_DATA: string;
  VALUE_DATA: string;
}
