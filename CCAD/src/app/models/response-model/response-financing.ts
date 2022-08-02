export class ResponseFinancingIntegrator {
  isValid: boolean;
  message: string;
}

export class FINANCIACION {
  NUMERO_PRODUCTO: string;
  REFERENCIA_PAGO: string;
  SALDO_TOTAL: string;
  VALOR_PAGO_MINIMO: string;
  FECHA_CORTE: string;
  FECHA_LIMITE_PAGO: Date;
  CAPITAL_PENDIENTE_PAGO_INICIO: string;
  CAPITAL_PENDIENTE_PAGO_FINAL: string;
  TASA_INTERES_EA: string;
  TASA_USURA_EA: string;
  FECHA_CREACION_FINANCIACION: string;
  NRO_CUOTA_ACTUAL: string;
  NRO_CUOTAS_PENDIENTES: string;
  CAPITAL_A_PAGAR: string;
  INTERESES_CORRIENTES: string;
  INTERESES_MORA: string;
  IVA_INTERESES: string;
  SALDO_MORA: string;
  DIAS_MORA: string;
  VALOR_ULTIMO_PAGO: string;
  FECHA_ULTIMO_PAGO: string;
  ESTADO_FINANCIACION: string;
  REFERENCIA_EQUIPO: string;
  MIN: string;
  CO_ID: string;
  CUSTCODE_SERVICIO: string;
  CUSTCODE_RESPONSABLE_PAGO: string;
  NOMBRES: string;
  APELLIDOS: string;
  PROCESO: string;
}

export class MENSAJECONSUF {
  FINANCIACION: FINANCIACION;
}

export class MessageConsultaF {
  CODIGO: string;
  MENSAJE: MENSAJECONSUF;
  DESCRIPCION: string;
}


