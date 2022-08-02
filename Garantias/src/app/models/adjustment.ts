export interface Adjustment {
  adjustment: TnsAdjustment[]
}

export interface TnsAdjustment {
  chargeService: string[];
  snCode: string[];
  spCode: string[];
  glAccount: string[];
  tax: string[];
  printBox: string[];
  remark: string[];
  channel: string[];
  maxAmount: string[];
  minAmount: string[];
  debitCredit: string[];
  family: string[];
  paDivision: string[];
  paSegment: string[];
  paGrupServ: string[];
  occType: string[];
}
