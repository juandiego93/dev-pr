export class ResponseConsultarCuentas {
  codigo: string;
  mensaje: string;
  listaCuentas: Array<ListaCuentas>;
}

class ListaCuentas {
  estado: string;
  linea: string;
  referencia: string;
  tipoLinea: string;
  tipoOperacion: string;
}
