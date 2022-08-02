import { HeaderRequest } from './headerRequest';

export interface QueryAddressRequest {
  headerRequest: HeaderRequest
  idDireccion: string
  proyecto: string
  segmento: string
}
export interface QueryAddressResponse {
  headerResponse: HeaderResponse
  message: string
  messageType: string
  addresses: Address
}

interface HeaderResponse {
  responseDate: string
  traceabilityId: string
}

interface Address {
  addressId: string;
  adressReliability: string
  city: City
  igacAddress: string
  latitudeCoordinate: string
  lengthCoordinate: string
  listCarrierCover: Array<string>
  listCover: Array<ListCover>
  listHhpps: Array<ListHhpps>
  splitAddres: SplitAddress
  stratum: string
}

interface City {
  cityId: string
  claroCode: string
  daneCode: string
  geographycLevelType: string
  name: string
  uperGeographycLevel: UpperGeographycLevel
}

interface UpperGeographycLevel{
  daneCode: string
  geographycLevelType: string
  geographyStateId: string
  name: string
  region: Region
  uperGeographycLevel?: UpperGeographycLevel
}

interface Region {
  name: string
  regionId: string
  technicalCode: string
}

interface SplitAddress {
  barrio:string
  cuadViaPrincipal:string
  cpTipoNivel5:string
  dirPrincAlt:string
  estadoDirGeo:string
  idDirCatastro:string
  idTipoDireccion:string
  ltViaGeneradora:string
  ltViaPrincipal:string
  numViaGeneradora:string
  numViaPrincipal:string
  placaDireccion:string
  tipoViaPrincipal:string
}

interface ListCover {
  qualificationDate: string
  node: string
  state: string
  technology: string
}

interface ListHhpps {
  accountNumber:number
  constructionType:string
  hhppId: string
  node: Node
  rushtype:string
  state: string
  technology: string
  viability: Viability
}

interface Viability {
  codRespuesta:string
  mensajeRespuesta:string
  ResultadoValidacion:string
}

interface Node {
  codeNode: string
  qualificationDate: string
  nodeName: string
  state: string
  technology: string
}
