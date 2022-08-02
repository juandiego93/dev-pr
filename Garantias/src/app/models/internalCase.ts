export class InternalCase {
  caseId: string;
  subscription: string;
  clientName: string;
  numeroDocumento: string;
  tipoDocumento: string;
  caseStatus: string;
  diagnosis: string;
  storageDays: string;
  observation: string;
  equipmentOnLoan: string;

  disableInternalCase: boolean;

  // nuevos campos
  documentType: any;
  documentNumber: string;
  imei: string;
  serial: string;
  idInternalCase: string;
  state: any;
  idOds: string;
}

export class InternalCaseValues {
  estado= false;
  tipoCaso = false;
  descripcion = false;
  idDocumentoRespuesta = false;
  imei = false;
  serial = false;
  idInternalCase = false;
  idOds = false
}
export class UpdateCaseValues{
  scalation = false;
  state= false;
  observations = false;
  idInternalCase = false;
  entryDate = false;
}
