export interface ResponseCTypification {
    isValid: boolean;
    message: string;
}

export class Category {
    name: string;
    code: string;
    subcategory: Subcategory[];
}
export class TypeOfCase {
    name: string;
}

export class ClosingCode {
    name: string;
    code: string;
}

export class Servicio {
    name: string;
    code: string;
}

export class CustomerVoice {
    name: string;
    code: string;
    typeOfCase: TypeOfCase[];
    ClosingCode: ClosingCode[];
    servicio: Servicio[];
}

export class Subcategory {
    name: string;
    code: string;
    customerVoice: CustomerVoice[];
}

export interface ResponseMessages {
    _responseStatus: string;
    category: Category[];
}


