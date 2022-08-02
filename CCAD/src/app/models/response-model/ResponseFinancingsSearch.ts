export class ResponseFinancingsSearch {
  responseStatus: Responsestatus;
  financings: Financings;
  quantitySpecified: boolean;
}


export class Responsestatus {
  code: string;
  message: string;
  status: string;
}

export class Financings {
  remainingBalance: number;
  remainingBalanceSpecified: boolean;
  currentOpentAmount: number;
  currentOpentAmountSpecified: boolean;
  financing: Financing[];
}

export class Financing {
  financingCode: string;
  financingID: string;
  administrativeFee: number;
  administrativeFeeSpecified: boolean;
  administrativeFeePeriod: string;
  amortizationSystem: string;
  billCycle: string;
  paymentReference: string;
  debitState: string;
  debtInsuranceFeee: number;
  debtInsuranceFeeSpecified: boolean;
  term: number;
  termSpecified: boolean;
  lastTerm: number;
  lastTermSpecified: boolean;
  remainingTerm: number;
  remainingTermSpecified: boolean;
  equipmentInsuranceFeee: number;
  equipmentInsuranceFeeSpecified: boolean;
  monthlyFeee: number;
  monthlyFeeSpecified: boolean;
  numbererestRatee: number;
  numbererestRateSpecified: boolean;
  numbererestType: string;
  numbererestTaxe: number;
  numbererestTaxSpecified: boolean;
  equipmentReference;
  brand: string;
  model: string;
  equipmentRef1: string;
  equipmentRef2: string;
  initialCapitale: number;
  initialCapitalSpecified: boolean;
  initialDate: string;
  endCapitale: number;
  endCapitalSpecified: boolean;
  endDate: string;
  dueDate: string;
  lastPaymente: number;
  lastPaymentSpecified: boolean;
  lastPaymentDate: string;
  latePaymentAmounte: number;
  latePaymentAmountSpecified: boolean;
  latePaymentnumberereste: number;
  latePaymentnumbererestSpecified: boolean;
  latePaymentTaxe: number;
  latePaymentTaxSpecified: boolean;
  baseAmounte: number;
  baseAmountSpecified: boolean;
  openAmounte: number;
  openAmountSpecified: boolean;
  paymentToCapitale: number;
  paymentToCapitalSpecified: boolean;
  regularnumberereste: number;
  regularnumbererestSpecified: boolean;
  maxLegalnumbererestRatee: number;
  maxLegalnumbererestRateSpecified: boolean;
  remainingBalancee: number;
  remainingBalanceSpecified: boolean;
  segment: string;
}
