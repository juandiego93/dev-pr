export class ResponseConsultaDireGeneral {
  type: string;
  message: string;
  messageType: string;
  idCentroPoblado: string;
  centroPoblado: string;
  listsAddress: Listaddress[];

}
export class Listaddress {
  splitAddres: Splitaddres;
}

export class Splitaddres {
  idDireccionDetallada: string;
  dirPrincAlt: string;
  barrio: string;
  tipoViaPrincipal: string;
  numViaPrincipal: string;
  ltViaPrincipal: string;
  cuadViaPrincipal: string;
  numViaGeneradora: string;
  ltViaGeneradora: string;
  placaDireccion: string;
  cpTipoNivel5: string;
  estadoDirGeo: string;
  direccionTexto: string;
}
