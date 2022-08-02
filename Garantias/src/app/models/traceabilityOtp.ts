export interface RequestTraceabilityOtp {
  cvcTraza: string; // ID Transacción - GUID  o  Mismo documentTraza si aun no existe transacción
  userCreate: string; // Usuario que genera la acción de log.
  applicationTraza: string; // Aplicación que genera la traza (IMEI, Cuenta al día, etc)

  documentTraza: string; // tipo - número de documento asociado a la traza
  medioTraza: string; // min asociado a la traza

  flowTraza: string; // Nombre del flujo que genera la traza (Consulta, Cesión, etc)
  descriptionTraza: string; // Nombre método - Nombre metodo ws
  dataTraza: any; // Request traza
  valueTraza: any; // Response traza
  error: boolean;
}

export interface ResponseTraceabilityOtp {
  isValid: boolean;
  description: string;
}
