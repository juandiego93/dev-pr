export interface Device {
  serial: string;
  brand: string;
  model: string;
  state: string;
  reference: string;
  reserve: boolean;
  disableInventory: boolean;
}

export class DeviceValues {
  serial = false
  brand = false
  model = false
  state = false
  reserve = false
  reference = false
}
