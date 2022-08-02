export interface ResponseNotification {
    headerResponse: {
        responseDate: string,
        traceabilityId: string
    },
    isValid: string,
    message: string
}