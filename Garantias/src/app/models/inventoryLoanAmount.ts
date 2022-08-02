export interface InventoryLoanAmountRequest {
  sku: string;
  serial: string;
  user: string;
}

export interface InventoryLoanAmountResponse {
  loanAmount: number;
  state: number;
  description: string;
  message: string;
}
