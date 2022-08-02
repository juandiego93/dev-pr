export interface ResponseGetTreeRestructuring {
  isValid: boolean;
  message: string;
}

export interface Dato {
  Cuenta: string;
  Departamento: string;
  Estado: string;
  Direccion: string;
  Multiplay: string;
  cicloFacturacion: string;
  cuentaDomiciliada: string;
}

export interface Informacion {
  Datos: Dato[];
}

export interface ResponseMessageGetTreeRestructuring {
  PCODRTA: string;
  Informacion: Informacion;
  PIDSUSC: string;
  PMSGRTA: string;
}



