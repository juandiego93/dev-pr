export interface DynamicDocAccountCertification {
  idTemplate: number; // Identificador único de la plantilla.
  data: AccountCertification; // Objeto correspondiente a las propiedades requeridas para la generación del documento.
}

export interface AccountCertification {
  name: string; // nombre
  numberId: string; // numero id del cliente
  billDay: string; // dia de facturacion
  billMonth: string;// mes de facturacion
  billYear: string;// año de facturacion
  payDay: string; // dia de pago
  payMonth: string;// mes de pago
  payYear: string;//año de pago
  currentDay: string; // dia actual
  currentMonth: string;// mes actual
  currentYear: string;// año actual
  table?: string;
  addresService: string;// direccion de servicio
  typeDocument: string;// tipo de documento
  serviceName: string;// nombre del servicio(account)
  serviceNumber: string;//numero de servicio
  valuePayment: any;// valor de pago
  user: string;// usuario
  consecutive: string;// consecutivo
  tdWidth?: string; //ancho de columna
}
