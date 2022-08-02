export class RequestConsultaDireGeneral {
  headerRequest:any;
  codigoDane: string;
  direccion: string;
  direccionTabulada: Direcciontabulada;
}

export class Direcciontabulada {
  idTipoDireccion = 'CK';
  tipoViaPrincipal = '';
  numViaPrincipal = '';
  numViaGeneradora = '';
  placaDireccion = '';
  cpTipoNivel5 = '';
  cpValorNivel5 = '';
}
