export interface ContextAttributeRequest {
    documentType: string,
    id: string,
    account: string
}

export interface ContextAttributeResponse {
    ok: boolean;
    messagge: string;
    body: BodyReresponseAC[];
}

export interface BodyReresponseAC {
    customerID: string,
    subscriptions : Subscription[]
}

export interface Subscription {
    subscriberNumber: string,
    contextAttributes: ContextAttribute[]
}

export interface ContextAttribute {
    name: string,
    value: string
}