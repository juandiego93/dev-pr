export class ResponseGetBizInteraction{
    headerResponse:any;
    isValid : boolean;
    message : string;
}
export class MessageGetBiz{
    page:number;
    totalRows:number;
    totalPages:number;
    customerInteractions:customerInteractions[];
}
export interface customerInteractions{

    description:string;
    externalTransactionId:string;
    interactionDirectionTypeCode:string;
    subject:string;
    channelTypeCode:number;
    customerCode:string;
    categoryCode:number;
    subCategoryCode:number;
    voiceOfCustomerCode:number;
    closeInteractionCode:number;
    domainName:string;
    userSignum:string;
    reason:string;
    regardingObjectId:string;
    biHeaderId:string;
    executionDate:string;
    typeObjectInteraction:typeObjectInteraction;
    presencialChannel:boolean;
    idTurn:string;
    idEvent:string;
    mood:string;
    service:string;
    mapValues:string;
    id:string;
    channelCode:string;
    accountCode:string;
    executionDateLong:number;
    _id:string;
    startDate:number;
    endDate:number;
    header:boolean;
    limit:number;
    page:number;

}
export interface typeObjectInteraction{
    relatedObjectType:string;
    orderNumber:string;
    caseNumber:string;
}
