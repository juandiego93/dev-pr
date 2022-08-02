import { EvalSource } from "./generic";

export class RequestParameter {
  name: string;
}

export interface ResponseParameter {
  ID_PARAMETER: string;
  NAME_PARAMETER: string;
  VALUE_PARAMETER: string;
  DESCRIPTION_PARAMETER: string;
  TYPED: string;
  GROUP_PARAMETER: string;
}

export interface MensajesAplicacionLista {
  id: string;
  text: any;
}

export interface MensajesAplicacion {
  paramClassFlujos: MensajesAplicacionLista[];
}

export interface SoapWS{
  Url: string;
  Xml: string;
}

export class Parameter {
  FLUJOS_SERVICIOS: any;
  TOKEN_CASES_P: ResponseParameter;
  WSCASES_PARAMETERS: any;
  TERMS_OF_SERVICE: any;
  CASE_STATES: any;
  BODY_CATALOGMANAGEMENT: any;
  AP_CR_TURNOS: any;
  URLServicios: any;
  SUBSCRIPTION_TYPE: any;
  URLSERVICIOSG: {
    SiteRefundOfMoney: string,
    ChangeOwnership: string,
    WsInventoryLoanAmount: string,
    WsCatalogManagement: string,
    WsPostSaleInsp: string;
    WsPostSaleDevolution: string;
    WsPostSaleInspParam: string;
    WsUploadDoc: string;
    WsSapInventory: string;
    WsQueryAddress: string;
    WsBillingCycle: string;
    WsSubscriberP: SoapWS,
    WsCustomerBO: SoapWS,
    WsGetAdjustmentsManagement: SoapWS,
    WsGetTypeAdjustmentsManagement: SoapWS,
    WsChargesNotification: SoapWS,
    WsChargesNotificationAdjust: SoapWS,
    WsPaymentServiceOrder: SoapWS;
    WsVerifyPayment: SoapWS;
    WsSuccessFactor: SoapWS;
    WsGetFinancingInfo: SoapWS;
    WsCancelFinancing: SoapWS;
    WsPaymentReferences: SoapWS;
    WsFinancigReason:SoapWS;
    WsSalesEntryPoint: string;
    WsSalesSCByToken: string;
    WsSalesOrderItem:string;
    WsSapInventoryCreateOrder:string;
    WsContextAttributes:string;
    WsSendMessageModification:SoapWS;
  }
  TOKEN_CASES: {
    Expiration: string,
    Token: string
  };
  WARRANTY_MESSAGES: {
    ClosedCase: string,
    AssignedCase: string,
    EndAttention: string,
    EquipmentOnLoan: string,
    NotReceiveEquipment: string,
    Refresh: string,
    Fraud: string,
    NoAssociatedOrder: string,
    PendingOrder: string,
    PaymentNotDone: string,
    OccCreated: string
    Notificacion: string;
    NotificationGoodCondition: string;
    NotificationBadCondition: string;
    NotificationPayment: string;
    NotificationNoPayment: string;
    CashPaymentNotVerify: string;
    RequestEquipment: string;
    DeliverEquipmentCST: string;
    DeliverEquipmentStoreman: string;
    PaymentDone:string;
    EquipmentNoLoan: string;
    RedirectOwnershipSite:string;
    RequestInvoiceStorage: string;
    InternalCaseClosed: string;
    CashPaymentToInvoice: string;
    InfoNotFound: string;
    DocumentsUploaded:string;
    RememberFiles:string;
    ProductNotAvailable:string;
    RepairedWithCost:string;
    RedirectCSTManagementSite: string
    cstFullFilledTimes:string;
    redirectMoneyRefound: string;
    NotFavorBalance: string;
    RememberStorage:string;
    ReceivedForReview:string;
    CheckPriority: string;
    CheckStock: string;
    DeliverToCustomer: string;
    NotProfileAuthorized:string;
    RepairedWithouthCost:string;
    RepairedByLaw1480: string;
    DeliverEquipmenttoAssesor:string;
    WarrantyTransact:string;
    NoRepairedByLaw1480: string;
    NoDeadInBox: string;
    DeliverEquipmentCSTStoreman: string;
    OnlyRepaired:string;
    OnlyPresencialAttention: string;
    cstNoFullFilledTimes:string;
    ClientWithAccesories: string;
    ClientWithNoAccesories: string;
    AccesoriesRegistered:string;
    NotFinanced: string;
    YesFinanced: string;
    DeadInBoxEquipment: string;
    NotProductOffering: string;
    NotProducOfferingIdToImei: string;
    StoragePaymentNotVerified:string;
    ServiceNotAvailable:string;
    NotAssociatedInformation: string;
    NotCavsAssociated: string;
    EndAttentionPQR: string;
    CheckPayDone: string;
    InformationError: string;
    PleaseUpdateODS: string;
    AccessoriesMustReturn: string;
    CheckReceiveReturnedProduct: string;
    WarrantyNotification: string;
    NegotiateProposal: string;
    OccDeleted: string;
    AdjustmentDone: string;
    AdjustmentSuccessful: string;
    CreditCancellation: string;
    ClientProPayment: string;
    ReserveEquipment: string;
    CloseSale: string;
    ExternalInventoryClassification:string;
    OwnInventoryClassification:string;
    ScheduleVisit:string;
    DeleteItemOk:string;
    CreditCancellationError: string;
    OrderGeneration: string;
    StockWithTrue: string;
    SendMessageModification: string;
    InvoiceCancellation: string;
  };
  WARRANTY_VALUES: {
    MaximumDaysAtOriginPoint: number,
    StorageCost:number,
    CostPercentage: {
      1: string,
      2: string,
      3: string,
    },
    ValidStatesOCC: [string],
    ValidStatesDeliveryTime: [string],
    AdmittedErrors500: [string]
  };
  CASE_STATES_DDL: any;
  NOTIFICATIONVALUES:any;
  IMAGEHEADERODS: any;
  INCREMENTALINVOICE: any;
  STATESVERIFYCASH: any;
  IMAGE_SUCCES: any;
  IMAGE_ERROR: any;
  MANAGE_DOCUMENTS_SERVICE:{
    xdTipoDocumental: string;
    xdEmpresa: string;
    xdIdVenta: any;
    xdCustomerCod: any;
    xdIdProceso:any;
  };
  WS_DOCUMENTS_MNG: SoapWS;
  CLIENT_TRANSACTION_SOURCE: Array<EvalSource>;
  GENERALS_48:{
    PassportUCM:string;
    PassportINS: string;
    statusReasonCancell: string;
  };
  TESTSINSALDO: [number] //Parámetro solo para prueba de escenarios sin saldo. Eliminar cuando se prueben todos los escenarios por QA o ya no sea requerido.
}


