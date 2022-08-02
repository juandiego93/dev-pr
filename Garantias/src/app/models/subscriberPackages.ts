export class SubscriberPackages {
  services: Service[];
}

export class Service {
  servicesAccount: Servicesaccount[];
}

export class Servicesaccount {
  subscriberNumber: string[];
  accountNumber: string[];
  address: string[];
  municipality: string[];
  type: string[];
  activationDate: Date[];
  status: string[];
  serviceList: Servicelist[];
  subscriptionList: Subscriptionlist[];
}

export class Servicelist {
  service: Service1[];
}

export class Service1 {
  id: string[];
  name: string[];
  status: string[];
}

export class Subscriptionlist {
  subscription: Subscription[];
}

export class Subscription {
  name: string[];
  description: string[];
  startDate: Date[];
  poId: string[];
  productCharacteristics: Productcharacteristic[];
}

export class Productcharacteristic {
  name: string[];
  value: string[];
}
