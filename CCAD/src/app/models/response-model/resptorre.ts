export interface Resptorre {

    headerResponse: HeaderResponse;
    isValid: string;
    message: string;
  
  }
  
  export interface HeaderResponse {
    responseDate: Date;
    traceabilityId: string;
  }
