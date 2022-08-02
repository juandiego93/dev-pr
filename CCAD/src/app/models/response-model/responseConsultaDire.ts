export class ResponseConsultaDire {
  message: string;
  messageType: string;
  addresses: Addresses;
}

export class Addresses {
  addressId: string;
  city: City;
  igacAddress: string;
  adressReliability: number;
  latitudeCoordinate: string;
  lengthCoordinate: string;
  splitAddres: SplitAddres;
  listCover: ListCover[];
  listCarrierCover: string[];
  stratum: string;
  mensajeDireccionAntigua?: any;
  listHhpps: ListHhpp[];
}

export class UperGeographycLevel2 {
  geographyStateId: number;
  name: string;
  daneCode: string;
  geographycLevelType: string;
  uperGeographycLevel?: any;
}

export class UperGeographycLevel {
  geographyStateId: number;
  name: string;
  daneCode: string;
  geographycLevelType: string;
  uperGeographycLevel: UperGeographycLevel2;
}

export class Region {
  regionId: number;
  name: string;
  technicalCode: string;
}

export class City {
  cityId: number;
  name: string;
  daneCode: string;
  uperGeographycLevel: UperGeographycLevel;
  region: Region;
  claroCode: string;
  geographycLevelType: string;
}

export class SplitAddres {
  idTipoDireccion: string;
  dirPrincAlt: string;
  barrio: string;
  tipoViaPrincipal: string;
  numViaPrincipal: string;
  ltViaPrincipal: string;
  nlPostViaP?: any;
  bisViaPrincipal?: any;
  cuadViaPrincipal: string;
  tipoViaGeneradora?: any;
  numViaGeneradora: string;
  ltViaGeneradora: string;
  nlPostViaG?: any;
  bisViaGeneradora?: any;
  cuadViaGeneradora?: any;
  placaDireccion: string;
  cpTipoNivel1?: any;
  cpTipoNivel2?: any;
  cpTipoNivel3?: any;
  cpTipoNivel4?: any;
  cpTipoNivel5: string;
  cpTipoNivel6?: any;
  cpValorNivel1?: any;
  cpValorNivel2?: any;
  cpValorNivel3?: any;
  cpValorNivel4?: any;
  cpValorNivel5?: any;
  cpValorNivel6?: any;
  mzTipoNivel1?: any;
  mzTipoNivel2?: any;
  mzTipoNivel3?: any;
  mzTipoNivel4?: any;
  mzTipoNivel5?: any;
  mzValorNivel1?: any;
  mzValorNivel2?: any;
  mzValorNivel3?: any;
  mzValorNivel4?: any;
  mzValorNivel5?: any;
  idDirCatastro: string;
  mzTipoNivel6?: any;
  mzValorNivel6?: any;
  itTipoPlaca?: any;
  itValorPlaca?: any;
  estadoDirGeo: string;
  letra3G?: any;
}

export class ListCover {
  technology: string;
  node: string;
  state: string;
  qualificationDate: string;
  hhppExistente: boolean;
  isChecked: boolean;
  poligono?: any;
  stateName: string;
}

export class Viability {
  resultadoValidacion: boolean;
  mensajes?: any;
  codRespuesta: string;
  mensajeRespuesta: string;
  nombreProyecto?: any;
}

export class Node {
  codeNode: string;
  state: string;
  qualificationDate: string;
  nodeName: string;
  technology: string;
}

export class ListHhpp {
  hhppId: number;
  state: string;
  technology: string;
  viability: Viability;
  node: Node;
  subCcmmTechnology?: any;
  listAddresMarks?: any;
  constructionType: string;
  rushtype: string;
  notasHhpp?: any;
}
