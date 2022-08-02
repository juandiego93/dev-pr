export interface ConsultaCimResponse {
    isValid: boolean;
    message: ConsultaCimMessageResponse;
}

export interface ConsultaCimMessageResponse {
    isValid:                  boolean;
    description:              string;
    documentNumber:           string;
    documentType:             string;
    firstName:                string;
    firstSurname:             string;
    email:                    string;
    principalAddress:         string;
    dataOrigin:               string;
    doNotEmail:               string;
    doNotSMSInstantMessaging: string;
    lastModified:             Date;
    city:                     string;
    departament:              string;
    phoneNumber:              string;
    accountNumber:            string;
}
