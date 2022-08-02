export class CustomerOrder {
  customerId: string[];
  customerOrderId: string[];
  channel: string[];
  createDate: Date[];
  stateCode: string[];
  stateDesc: string[];
  biType: string[];
  requestedStartDate: string[];
  serviceOrders: ServiceOrder[];
}

export class ServiceOrder {
  id: string[];
  status: string[];
  statusDesc: string[];
  location: string[];
  type: string[];
  subType: string[];
  family: string[];
  apptNumber: string[];
  contract: string[];
  ponr: string[];
  createDate: Date[];
  updateDate: Date[];
  endDate: Date[];
  slaDate: Date[];
  resourceNumber: string[];
  customerName: string[];
  address: string[];
  city: string[];
}

