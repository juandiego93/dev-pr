import { HeaderRequest } from './headerRequest';

// REQUEST
export interface IGetConcepts extends HeaderRequest {
  indicatorId : string;
}


// RESPONSE
export interface IGetConceptsResponse {
  headerResponse: HeaderResponse;
  isValid:        boolean;
  message:        Concept[];
}

export interface HeaderResponse {
  responseDate:   Date;
  traceabilityId: string;
}

export interface Concept {
  CUENTA_CONTABLE:    string;
  DESCRIPCION_CTA:    string;
  SERVICIO:           string;
  DESC_SERVICIO:      string;
  SUBTIPO_RED:        string;
  CATEGORIA_SERVICIO: string;
  CODIGO_SERVICIO:    string;
  VALOR_IVA:          string;
  TIPO_SERVICIO:      string;
  JOBCOST_ID:         string;
  JOB:                string;
  COSTO_EVENTO:       string;
  INDICADOR_MONTO:    string;
}

export interface TypeAdjustments {
  charge: string,
  remark: string
}



