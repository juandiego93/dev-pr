export interface ResponseParameter {
  ID_PARAMETER: string;
  NAME_PARAMETER: string;
  VALUE_PARAMETER: string;
  DESCRIPTION_PARAMETER: string;
  TYPED: string;
}

export interface MensajesAplicacionLista {
  id: string;
  text: any;
}

export interface MensajesAplicacion {
  paramClassFlujos: MensajesAplicacionLista[];
}
